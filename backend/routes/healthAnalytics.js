const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { calculateHealthMetrics } = require('../services/healthAnalyticsService');
const { authenticateToken } = require('../middleware/auth');

/**
 * GET /api/health-analytics/generate/:patientId
 * Triggers AI analysis for a specific patient and returns cumulative health metrics.
 */
router.get('/generate/:patientId', authenticateToken, async (req, res) => {
    try {
        let { patientId } = req.params;

        // If patientId is '0' or 'me', use the authenticated user's ID
        if (patientId === '0' || patientId === 'me') {
            patientId = req.user.roleId;
        }

        // Security check: Only patients can access their own data, or doctors can access their patients
        if (req.user.role === 'patient' && req.user.roleId != patientId) {
            return res.status(403).json({ message: 'Forbidden: You can only generate your own health insights.' });
        }

        const { date } = req.query;
        console.log(`[AI-ANALYTICS] Fetching data for patientId: ${patientId}${date ? ` on date: ${date}` : ''}`);

        // 1. Fetch patient health records
        const [rows] = await db.execute(
            'SELECT * FROM patient_health_data WHERE patient_id = ? ORDER BY created_at ASC',
            [patientId]
        );

        console.log(`[AI-ANALYTICS] Found ${rows.length} rows for patientId: ${patientId}`);

        if (rows.length === 0) {
            return res.status(200).json({
                message: 'No health data found for this patient.',
                health_score: 0,
                risk_level: 'Unknown',
                alerts: 'None',
                trends: {},
                predictions: {},
                insights: 'Start recording your health data to get AI-powered insights.'
            });
        }

        // 2. Calculate metrics
        const metrics = calculateHealthMetrics(rows, date);

        if (!metrics) {
            return res.status(200).json({
                message: 'No health records found for this specific date.',
                health_score: 0,
                risk_level: 'Unknown',
                alerts: 'None',
                trends: {},
                predictions: {},
                insights: 'No AI analysis available for this day.'
            });
        }

        // 3. Store or update results in patient_health_metrics ONLY IF it's the latest (no date filter)
        if (!date) {
            const [existing] = await db.execute(
                'SELECT id FROM patient_health_metrics WHERE patient_id = ?',
                [patientId]
            );

            if (existing.length > 0) {
                await db.execute(
                    `UPDATE patient_health_metrics SET 
                        health_score = ?, 
                        risk_level = ?, 
                        alerts = ?, 
                        trends = ?, 
                        predictions = ?, 
                        insights = ?, 
                        analysis_date = NOW()
                    WHERE patient_id = ?`,
                    [metrics.health_score, metrics.risk_level, metrics.alerts, metrics.trends, metrics.predictions, metrics.insights, patientId]
                );
            } else {
                await db.execute(
                    `INSERT INTO patient_health_metrics (patient_id, health_score, risk_level, alerts, trends, predictions, insights, analysis_date) 
                    VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
                    [patientId, metrics.health_score, metrics.risk_level, metrics.alerts, metrics.trends, metrics.predictions, metrics.insights]
                );
            }
        }

        // 4. Return the results
        res.json({
            patient_id: patientId,
            analysis_date: metrics.analysis_date,
            health_score: metrics.health_score,
            risk_level: metrics.risk_level,
            alerts: metrics.alerts,
            // Ensure trends and predictions are returned as Objects
            trends: (metrics.trends && typeof metrics.trends === 'string') ? JSON.parse(metrics.trends) : (metrics.trends || {}),
            predictions: (metrics.predictions && typeof metrics.predictions === 'string') ? JSON.parse(metrics.predictions) : (metrics.predictions || {}),
            insights: metrics.insights
        });
        console.log(`[AI-ANALYTICS] Successfully generated and returned health insights for patientId: ${patientId}`);

    } catch (error) {
        console.error(`[AI-ANALYTICS] Error generating health insights for patientId: ${req.params.patientId || 'N/A'}:`, error);
        res.status(500).json({ message: 'Server error generating health insights' });
    }
});

module.exports = router;
