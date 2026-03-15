import React from 'react';
import { SetupWizard } from './SetupWizard';

interface SetupPageProps {
  onComplete: () => void;
}

const SetupPage: React.FC<SetupPageProps> = ({ onComplete }) => {
  return <SetupWizard onComplete={onComplete} />;
};

export { SetupPage };
