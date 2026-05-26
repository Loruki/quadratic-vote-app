'use client';

import { ArrowRight, Coins, Scale, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface Props {
  open: boolean;
  creditsPerVoter: number;
  onClose: () => void;
}

export function TooltipWalkthrough({ open, creditsPerVoter, onClose }: Props) {
  const [step, setStep] = useState(0);
  const steps = [
    {
      icon: <Coins className="h-5 w-5" />,
      title: `You have ${creditsPerVoter} credits`,
      body: 'Spend them across the options below. Each option starts at 0 — tap + to add a vote.',
    },
    {
      icon: <Scale className="h-5 w-5" />,
      title: 'Concentrating costs more',
      body: '1 vote = 1 credit. 2 votes = 4. 3 votes = 9. The cost curve forces honest priorities — you can’t cheaply upvote everything.',
    },
    {
      icon: <Sparkles className="h-5 w-5" />,
      title: 'Submit when you’re happy',
      body: 'Stepping a vote back refunds credits. Once you submit, your ballot is locked — but you can shape it however you want first.',
    },
  ];
  const current = steps[step];
  const last = step === steps.length - 1;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent showCloseButton={false} className="sm:max-w-md">
        <DialogHeader>
          <div className="mb-2 inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
            {current.icon}
          </div>
          <DialogTitle>{current.title}</DialogTitle>
          <DialogDescription className="text-base text-foreground/80">
            {current.body}
          </DialogDescription>
        </DialogHeader>

        <div className="flex justify-center gap-1.5 pt-1">
          {steps.map((_, i) => (
            <span
              key={i}
              className={`h-1.5 w-6 rounded-full transition-colors ${
                i === step ? 'bg-primary' : 'bg-muted'
              }`}
              aria-hidden
            />
          ))}
        </div>

        <DialogFooter className="sm:justify-between">
          <Button variant="ghost" onClick={onClose}>
            Skip
          </Button>
          {last ? (
            <Button
              onClick={onClose}
              className="bg-grad-brand text-primary-foreground shadow-soft hover:opacity-95"
            >
              Start voting <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={() => setStep((s) => Math.min(s + 1, steps.length - 1))}>
              Next <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
