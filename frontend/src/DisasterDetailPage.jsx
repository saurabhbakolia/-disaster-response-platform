import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';

const VITE_API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function DisasterDetailPage() {
    const { disasterId } = useParams();
    const [disaster, setDisaster] = useState(null);
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [reportContent, setReportContent] = useState('');

    const fetchDisasterAndReports = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            // Fetch disaster details
            const disasterRes = await fetch(`${VITE_API_URL}/api/disasters/${disasterId}`);
            if (!disasterRes.ok) throw new Error('Disaster not found');
            const disasterData = await disasterRes.json();
            setDisaster(disasterData);

            // Fetch reports for the disaster
            const reportsRes = await fetch(`${VITE_API_URL}/api/disasters/${disasterId}/reports`);
            if (!reportsRes.ok) throw new Error('Could not fetch reports');
            const reportsData = await reportsRes.json();
            setReports(reportsData);
        } catch (err) {
            setError(err.message);
            console.error('Failed to fetch data:', err);
        } finally {
            setLoading(false);
        }
    }, [disasterId]);

    useEffect(() => {
        fetchDisasterAndReports();
    }, [fetchDisasterAndReports]);

    const handleReportSubmit = async (e) => {
        e.preventDefault();
        if (!reportContent.trim()) return;

        try {
            const res = await fetch(`${VITE_API_URL}/api/disasters/${disasterId}/reports`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: reportContent }),
            });
            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.error || 'Failed to submit report');
            }
            setReportContent('');
            fetchDisasterAndReports(); // Refresh data
        } catch (err) {
            console.error('Report submission error:', err);
            setError(err.message);
        }
    };

    const handleImageUpload = async (reportId, file) => {
        if (!file) return;

        const formData = new FormData();
        formData.append('reportImage', file);

        try {
            const res = await fetch(`${VITE_API_URL}/api/disasters/${disasterId}/reports/${reportId}/verify`, {
                method: 'POST',
                body: formData,
            });

            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.error || 'Failed to upload image');
            }

            // Refresh data to show updated verification status
            fetchDisasterAndReports();
        } catch (err) {
            console.error('Image upload error:', err);
            setError(`Image upload failed for report ${reportId}: ${err.message}`);
        }
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error} <Link to="/">Go Back</Link></div>;
    if (!disaster) return <div>Disaster not found. <Link to="/">Go Back</Link></div>;

    return (
        <div className="container">
            <header className="page-header">
                <Link to="/">&larr; Back to All Disasters</Link>
                <h1>{disaster.title}</h1>
                <p className="disaster-location">{disaster.location_name}</p>
                <div className="tags">
                    {disaster.tags && disaster.tags.map(tag => <span key={tag} className="tag">{tag}</span>)}
                </div>
            </header>

            <div className="page-content">
                <div className="column">
                    <h2>Description</h2>
                    <p>{disaster.description}</p>

                    <h2>Submit a New Report</h2>
                    <form onSubmit={handleReportSubmit} className="report-form">
                        <textarea
                            value={reportContent}
                            onChange={(e) => setReportContent(e.target.value)}
                            placeholder="Provide an update or observation..."
                            required
                        />
                        <button type="submit">Submit Report</button>
                    </form>
                </div>

                <div className="column">
                    <h2>User Reports ({reports.length})</h2>
                    <div className="scroll-box">
                        {reports.length > 0 ? reports.map(report => (
                            <div key={report.id} className="report-item">
                                <p>{report.content}</p>
                                <div className="report-meta">
                                    <div>
                                        <small>Status: <span className={`status-text status-${report.verification_status}`}>{report.verification_status}</span></small>
                                        <small>By: {report.user_id}</small>
                                    </div>
                                    {report.verification_status === 'pending' && (
                                        <div className="upload-section">
                                            <label htmlFor={`file-upload-${report.id}`} className="custom-file-upload">
                                                Verify Image
                                            </label>
                                            <input
                                                id={`file-upload-${report.id}`}
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => handleImageUpload(report.id, e.target.files[0])}
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                        )) : <p>No reports yet for this disaster.</p>}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default DisasterDetailPage; 