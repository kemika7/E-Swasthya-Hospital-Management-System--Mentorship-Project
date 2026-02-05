import React from 'react';
import Card from '../../components/Card';

const DoctorCopilot = () => {
  return (
    <div className="layout-main">
      <div className="page-header">
        <h2 className="page-title">Doctor Copilot</h2>
      </div>

      <Card title="Clinical Decision Support (Mock UI)">
        <p style={{ fontSize: '0.9rem', opacity: 0.8, marginBottom: '0.75rem' }}>
          This page represents an AI-assisted copilot concept for doctors. It does not make any
          live API calls and only shows static UI components for your academic demo.
        </p>

        <div className="grid grid-cols-2">
          <div style={{ fontSize: '0.9rem' }}>
            <h4 style={{ margin: '0 0 0.5rem' }}>Suggested Workups</h4>
            <ul style={{ paddingLeft: '1.1rem', margin: 0, lineHeight: 1.7 }}>
              <li>Summarise last 3 visits for a patient.</li>
              <li>Highlight abnormal lab values that need attention.</li>
              <li>Show medication interactions for active prescriptions.</li>
            </ul>
          </div>
          <div style={{ fontSize: '0.9rem' }}>
            <h4 style={{ margin: '0 0 0.5rem' }}>Example Prompts</h4>
            <ul style={{ paddingLeft: '1.1rem', margin: 0, lineHeight: 1.7 }}>
              <li>“Generate a patient-friendly discharge summary.”</li>
              <li>“List follow-up questions for a chest pain complaint.”</li>
              <li>“Explain ECG findings in simple language.”</li>
            </ul>
          </div>
        </div>

        <p style={{ fontSize: '0.8rem', opacity: 0.7, marginTop: '1rem' }}>
          During viva, you can explain that this is intentionally designed as a static page to
          avoid backend complexity while still demonstrating how AI features could be integrated
          into a hospital system in the future.
        </p>
      </Card>
    </div>
  );
};

export default DoctorCopilot;

