/**
 * Health Analytics Service (v2)
 * Implements rule-based analytics with rich trends (deltas, messages).
 * Compatible with MySQL 5.5 (requires manual JSON serialization).
 */

const calculateHealthMetrics = (historicalData, targetDate = null) => {
    let dataset = [...historicalData].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

    if (targetDate) {
        const targetDay = targetDate.split('T')[0];
        // Ensure there is at least one record on this specific day to analyze
        const hasDataOnDay = dataset.some(h => {
             const hDate = new Date(h.created_at).toISOString().split('T')[0];
             return hDate === targetDay;
        });

        if (!hasDataOnDay) return null; // Signal that no analysis is possible for this specific date

        // Filter dataset to include everything UP TO the end of the target day
        const endOfTargetDay = new Date(targetDay);
        endOfTargetDay.setHours(23, 59, 59, 999);
        dataset = dataset.filter(h => new Date(h.created_at).getTime() <= endOfTargetDay.getTime());
    }

    if (!dataset || dataset.length === 0) {
        return {
            patient_id: null,
            health_score: 0,
            risk_level: "Unknown",
            alerts: "No health records found.",
            trends: JSON.stringify({ status: "Not enough data" }),
            predictions: JSON.stringify({ status: "Not enough data" }),
            insights: "Please start logging your daily health data to see AI insights.",
            analysis_date: targetDate || new Date().toISOString()
        };
    }

    const latest = dataset[dataset.length - 1];
    const previous = dataset.length > 1 ? dataset[dataset.length - 2] : null;

    // 1. Health Score Calculation (0-100)
    let score = 0;
    const rules = [
        { key: 'bmi', min: 18.5, max: 24.9, pts: 20 },
        { key: 'blood_pressure_systolic', max: 120, pts: 10 },
        { key: 'blood_pressure_diastolic', max: 80, pts: 10 },
        { key: 'glucose_level', min: 70, max: 100, pts: 15 },
        { key: 'sleep_hours', min: 7, max: 9, pts: 15 },
        { key: 'water_intake', min: 2, pts: 10 },
        { key: 'spo2', min: 95, pts: 10 },
        { key: 'exercise', val: 1, pts: 10 }
    ];

    rules.forEach(rule => {
        const val = latest[rule.key];
        if (val !== null && val !== undefined) {
            if (rule.val !== undefined) {
                if (val === rule.val) score += rule.pts;
            } else {
                let match = true;
                if (rule.min !== undefined && val < rule.min) match = false;
                if (rule.max !== undefined && val > rule.max) match = false;
                if (match) score += rule.pts;
            }
        }
    });

    // 2. Risk Level Assessment (ENUM-compliant)
    let riskLevel = "Normal";
    if (latest.blood_pressure_systolic > 140 || latest.blood_pressure_diastolic > 90) {
        riskLevel = "Hypertension Risk";
    } else if (latest.glucose_level > 125) {
        riskLevel = "Diabetes Risk";
    } else if (latest.bmi > 30) {
        riskLevel = "Obesity Risk";
    } else if (latest.spo2 < 92) {
        riskLevel = "Respiratory Risk";
    }

    // 3. Alerts Generation
    const alertsList = [];
    if (latest.blood_pressure_systolic > 140) alertsList.push("High Blood Pressure");
    if (latest.glucose_level > 140) alertsList.push("High Glucose Level");
    if (latest.spo2 < 95) alertsList.push("Low Oxygen (SPO2)");
    if (latest.temperature > 38) alertsList.push("Fever Detected");
    const alerts = alertsList.length > 0 ? alertsList.join(", ") : "None";

    // 4. Rich Trend Analysis (JSON)
    const trendData = {};
    const metricsToTrack = [
        { key: 'weight', unit: 'kg', label: 'Weight', threshold: 0.1 },
        { key: 'heart_rate', unit: 'BPM', label: 'Heart Rate', threshold: 2 },
        { key: 'sleep_hours', unit: 'Hours', label: 'Sleep', threshold: 0.5 },
        { key: 'water_intake', unit: 'Liters', label: 'Water', threshold: 0.1 }
    ];

    metricsToTrack.forEach(metric => {
        if (!previous || latest[metric.key] === null || previous[metric.key] === null) {
            trendData[metric.key] = { status: "not enough data", delta: 0, message: "No previous record for comparison" };
        } else {
            const delta = parseFloat((latest[metric.key] - previous[metric.key]).toFixed(2));
            let status = "stable";
            if (delta > metric.threshold) status = "increasing";
            else if (delta < -metric.threshold) status = "decreasing";

            let msg = `${metric.label} is stable compared to yesterday.`;
            if (status === "increasing") msg = `${metric.label} is higher than yesterday by ${Math.abs(delta)} ${metric.unit}.`;
            else if (status === "decreasing") msg = `${metric.label} is lower than yesterday by ${Math.abs(delta)} ${metric.unit}.`;

            trendData[metric.key] = { status, delta, message: msg };
        }
    });

    // 5. Predictions (Simplified Linear)
    const predictions = {};
    if (dataset.length >= 3) {
        const last3 = dataset.slice(-3);
        const predict = (key) => {
            const vals = last3.map(d => d[key]).filter(v => v !== null);
            if (vals.length < 2) return null;
            const avgChange = (vals[vals.length - 1] - vals[0]) / (vals.length - 1);
            return parseFloat((vals[vals.length - 1] + avgChange).toFixed(2));
        };
        predictions.bmi_next_month = predict('bmi');
        predictions.weight_next_month = predict('weight');
    } else {
        predictions.status = "Not enough data for predictions";
    }

    // 6. Personalized Insights
    const insightList = [];
    if (latest.water_intake < 2) insightList.push("Drink more water (at least 2L daily).");
    if (latest.sleep_hours < 7) insightList.push("You need more rest; aim for 7-9 hours of sleep.");
    if (latest.exercise === 0) insightList.push("Regular physical activity can improve your heart health.");
    if (latest.heart_rate > 100) insightList.push("Your heart rate is high; consider stress management or reducing caffeine.");
    if (latest.heart_rate < 50 && latest.heart_rate > 0) insightList.push("Your heart rate is quite low; ensure you're getting enough iron and rest.");
    
    if (latest.bmi > 25) insightList.push("Maintaining a healthy weight can reduce your risk of chronic diseases.");
    else if (latest.bmi < 18.5 && latest.bmi > 0) insightList.push("Consider increasing your caloric intake with nutrient-dense foods.");
    
    if (latest.glucose_level > 110) insightList.push("Monitor your sugar intake and try adding more fiber to your diet.");
    if (latest.spo2 < 94) insightList.push("Your oxygen levels are below optimal; consider breathing exercises or a medical check.");

    if (score > 85) insightList.push("Excellent work! You are maintaining great health habits.");
    else if (score > 70) insightList.push("Great job! You're on the right track to a healthy lifestyle.");
    
    if (riskLevel !== "Normal") insightList.push(`Special focus recommended regarding your ${riskLevel.toLowerCase()}.`);
    if (dataset.length < 3) insightList.push("Keep logging your data to unlock long-term trends and predictions.");
    
    const insights = insightList.length > 0 ? insightList.join(" ") : "Continue tracking your vitals daily.";

    return {
        patient_id: latest.patient_id,
        health_score: Math.min(score, 100),
        risk_level: riskLevel,
        alerts: alerts,
        trends: JSON.stringify(trendData), // Store as string for MySQL 5.5
        predictions: JSON.stringify(predictions), // Store as string for MySQL 5.5
        insights: insights,
        analysis_date: new Date().toISOString()
    };
};

module.exports = {
    calculateHealthMetrics
};
