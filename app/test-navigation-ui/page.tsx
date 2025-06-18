'use client';

import { defineStepper, WizardStepper } from '@/components/stepper';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

// Define a simple stepper for testing
const { Stepper, useStepper } = defineStepper(
  {
    id: 'step-1',
    title: 'Personal Info',
    description: 'Enter your personal information',
  },
  {
    id: 'step-2', 
    title: 'Contact Details',
    description: 'Provide your contact information',
  },
  {
    id: 'step-3',
    title: 'Review',
    description: 'Review and confirm your submission',
  }
);

function StepperContent() {
  const stepper = useStepper();
  const [metadata] = useState({
    completed: new Set(['step-1']),
    accessible: new Set(['step-1', 'step-2', 'step-3']),
  });

  return (
    <div className="space-y-8">
      {/* Horizontal Navigation */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Horizontal Navigation</h2>
        <WizardStepper 
          variant="horizontal" 
          stepper={stepper}
          metadata={metadata}
          showTooltips={true}
        />
      </div>

      {/* Mobile Navigation */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Mobile Navigation (Sheet)</h2>
        <WizardStepper 
          variant="mobile" 
          stepper={stepper}
          metadata={metadata}
          showTooltips={true}
        />
      </div>

      {/* Current Step Content */}
      <div className="border rounded-lg p-6">
        <h3 className="text-lg font-medium mb-2">Current Step: {stepper.current.title}</h3>
        <p className="text-muted-foreground mb-4">{stepper.current.description}</p>
        
        <div className="flex gap-4">
          <Button 
            variant="outline" 
            onClick={() => stepper.prev()} 
            disabled={stepper.current.id === stepper.all[0].id}
          >
            Previous
          </Button>
          <Button 
            onClick={() => stepper.next()} 
            disabled={stepper.current.id === stepper.all[stepper.all.length - 1].id}
          >
            Next
          </Button>
        </div>
      </div>

      {/* Step Information */}
      <div className="bg-muted/50 rounded-lg p-4">
        <h4 className="font-medium mb-2">Stepper State:</h4>
        <ul className="text-sm space-y-1">
          <li>Current Step: {stepper.current.id}</li>
          <li>Total Steps: {stepper.all.length}</li>
          <li>Completed: {Array.from(metadata.completed).join(', ')}</li>
          <li>Accessible: {Array.from(metadata.accessible).join(', ')}</li>
        </ul>
      </div>
    </div>
  );
}

export default function NavigationUITestPage() {
  return (
    <Stepper.Provider>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Navigation UI Test Page</h1>
          <p className="text-muted-foreground">
            This page demonstrates the enhanced WizardStepper component with both horizontal and mobile variants.
          </p>
        </div>
        
        <StepperContent />
      </div>
    </Stepper.Provider>
  );
} 