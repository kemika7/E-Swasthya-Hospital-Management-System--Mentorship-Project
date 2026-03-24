/**
 * Health Analytics Test Script
 * Verifies rule-based calculations, rich trends, and edge cases.
 */

const { calculateHealthMetrics } = require('../services/healthAnalyticsService');

const runTests = () => {
    console.log('--- Starting Health Analytics Tests ---');

    // Scenario 1: Normal Health Data (2 records)
    const normalData = [
        {
            patient_id: 1,
            created_at: '2026-03-23T10:00:00Z',
            weight: 70,
            bmi: 22,
            blood_pressure_systolic: 120,
            blood_pressure_diastolic: 80,
            glucose_level: 90,
            sleep_hours: 8,
            water_intake: 2.5,
            spo2: 98,
            temperature: 36.6,
            exercise: 1
        },
        {
            patient_id: 1,
            created_at: '2026-03-24T10:00:00Z',
            weight: 71,
            bmi: 22.3,
            blood_pressure_systolic: 118,
            blood_pressure_diastolic: 78,
            glucose_level: 92,
            sleep_hours: 7.5,
            water_intake: 2.2,
            spo2: 97,
            temperature: 36.5,
            exercise: 1
        }
    ];

    const result1 = calculateHealthMetrics(normalData);
    console.log('\nScenario 1: Normal Data');
    console.log('Score:', result1.health_score); // Should be high
    console.log('Risk Level:', result1.risk_level); // Should be Normal
    const trends1 = JSON.parse(result1.trends);
    console.log('Weight Trend:', trends1.weight.message); 
    console.log('Heart Rate Trend (Missing):', trends1.heart_rate.status);

    // Scenario 2: Critical Health Data
    const criticalData = [
        {
            patient_id: 2,
            created_at: '2026-03-24T10:00:00Z',
            weight: 95,
            bmi: 32, // Obesity
            blood_pressure_systolic: 150, // Hypertension
            blood_pressure_diastolic: 95,
            glucose_level: 160, // Diabetes risk
            sleep_hours: 5,
            water_intake: 1,
            spo2: 90, // Respiratory Risk
            temperature: 39, // Fever
            exercise: 0
        }
    ];

    const result2 = calculateHealthMetrics(criticalData);
    console.log('\nScenario 2: Critical Data');
    console.log('Score:', result2.health_score); // Should be low
    console.log('Risk Level:', result2.risk_level); // Should be Hypertension or Respiratory
    console.log('Alerts:', result2.alerts);
    console.log('Insights:', result2.insights);

    // Scenario 3: Missing Data (Only 1 record)
    const missingData = [
        {
            patient_id: 3,
            created_at: '2026-03-24T10:00:00Z',
            weight: 80,
            bmi: 25
            // other fields null
        }
    ];

    const result3 = calculateHealthMetrics(missingData);
    console.log('\nScenario 3: Missing Data / Snapshot');
    console.log('Trends Status:', JSON.parse(result3.trends).weight.status); // should be "not enough data"

    console.log('\n--- Tests Completed ---');
};

runTests();
