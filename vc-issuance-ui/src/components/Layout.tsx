import PayloadViewer from '@/templates/payloads/PayloadViewer';
import React from 'react';
import MultiStepForm from './MultiStepForm';

const Layout = () => {
  return (
    <div className="grid md:grid-cols-2 flex-row w-full h-full py-4">
      <div className="px-4 w-full">
        <MultiStepForm />
      </div>
      <div className="px-12 w-full">
        <PayloadViewer />
      </div>
    </div>
  );
};

export default Layout