import { Slot } from "@radix-ui/react-slot";
import * as Stepperize from "@stepperize/react";
import { type VariantProps, cva } from "class-variance-authority";
import * as React from "react";
import { Circle, CheckCircle, Lock, AlertCircle } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const StepperContext = React.createContext<StepperConfigProps | null>(null);

const useStepperProvider = (): StepperConfigProps => {
  const context = React.useContext(StepperContext);
  if (!context) {
    throw new Error("useStepper must be used within a StepperProvider.");
  }
  return context;
};

const defineStepper = <const Steps extends Stepperize.Step[]>(
  ...steps: Steps
): StepperDefineProps<Steps> => {
  const { Scoped, useStepper, ...rest } = Stepperize.defineStepper(...steps);

  const StepperContainer = ({
    children,
    className,
    ...divProps
  }: Omit<React.ComponentProps<"div">, "children"> & {
    children:
      | React.ReactNode
      | ((props: { methods: Stepperize.Stepper<Steps> }) => React.ReactNode);
  }) => {
    const methods = useStepper();

    return (
      <div
        date-component="stepper"
        className={cn("w-full", className)}
        {...divProps}
      >
        {typeof children === "function" ? children({ methods }) : children}
      </div>
    );
  };

  return {
    ...rest,
    useStepper,
    Stepper: {
      Provider: ({
        variant = "horizontal",
        labelOrientation = "horizontal",
        tracking = false,
        children,
        className,
        initialStep,
        initialMetadata,
        ...divProps
      }) => {
        return (
          <StepperContext.Provider
            value={{ variant, labelOrientation, tracking }}
          >
            <Scoped
              initialStep={initialStep}
              initialMetadata={initialMetadata}
            >
              <StepperContainer className={className} {...divProps}>
                {children}
              </StepperContainer>
            </Scoped>
          </StepperContext.Provider>
        );
      },
      Navigation: ({
        children,
        "aria-label": ariaLabel = "Stepper Navigation",
        ...props
      }) => {
        const { variant } = useStepperProvider();
        return (
          <nav
            date-component="stepper-navigation"
            aria-label={ariaLabel}
            role="tablist"
            {...props}
          >
            <ol
              date-component="stepper-navigation-list"
              className={classForNavigationList({ variant: variant })}
            >
              {children}
            </ol>
          </nav>
        );
      },
      Step: ({ children, className, icon, ...props }) => {
        const { variant, labelOrientation } = useStepperProvider();
        const { current } = useStepper();

        const utils = rest.utils;
        const steps = rest.steps;

        const stepIndex = utils.getIndex(props.of);
        const step = steps[stepIndex];
        const currentIndex = utils.getIndex(current.id);

        const isLast = utils.getLast().id === props.of;
        const isActive = current.id === props.of;

        const dataState = getStepState(currentIndex, stepIndex);
        const childMap = useStepChildren(children);

        const title = childMap.get("title");
        const description = childMap.get("description");
        const panel = childMap.get("panel");

        if (variant === "circle") {
          return (
            <li
              date-component="stepper-step"
              className={cn(
                "flex shrink-0 items-center gap-4 rounded-md transition-colors",
                className
              )}
            >
              <CircleStepIndicator
                currentStep={stepIndex + 1}
                totalSteps={steps.length}
              />
              <div
                date-component="stepper-step-content"
                className="flex flex-col items-start gap-1"
              >
                {title}
                {description}
              </div>
            </li>
          );
        }

        return (
          <>
            <li
              date-component="stepper-step"
              className={cn([
                "group peer relative flex items-center gap-2",
                "data-[variant=vertical]:flex-row",
                "data-[label-orientation=vertical]:w-full",
                "data-[label-orientation=vertical]:flex-col",
                "data-[label-orientation=vertical]:justify-center",
              ])}
              data-variant={variant}
              data-label-orientation={labelOrientation}
              data-state={dataState}
              data-disabled={Boolean(props.disabled).toString()}
            >
              <Button
                id={`step-${step.id}`}
                date-component="stepper-step-indicator"
                type="button"
                role="tab"
                tabIndex={dataState !== "inactive" ? 0 : -1}
                className="rounded-full"
                variant={dataState !== "inactive" ? "default" : "secondary"}
                size="icon"
                aria-controls={`step-panel-${props.of}`}
                aria-current={isActive ? "step" : undefined}
                aria-posinset={stepIndex + 1}
                aria-setsize={steps.length}
                aria-selected={isActive}
                onKeyDown={(e) =>
                  onStepKeyDown(
                    e,
                    utils.getNext(props.of),
                    utils.getPrev(props.of)
                  )
                }
                disabled={Boolean(props.disabled)}
                {...(({ disabled, ...rest }) => rest)(props)}
              >
                {icon ?? stepIndex + 1}
              </Button>
              {variant === "horizontal" && labelOrientation === "vertical" && (
                <StepperSeparator
                  orientation="horizontal"
                  labelOrientation={labelOrientation}
                  isLast={isLast}
                  state={dataState}
                  disabled={props.disabled}
                />
              )}
              <div
                date-component="stepper-step-content"
                className="flex flex-col items-start"
              >
                {title}
                {description}
              </div>
            </li>

            {variant === "horizontal" && labelOrientation === "horizontal" && (
              <StepperSeparator
                orientation="horizontal"
                isLast={isLast}
                state={dataState}
                disabled={props.disabled}
              />
            )}

            {variant === "vertical" && (
              <div className="flex gap-4">
                {!isLast && (
                  <div className="flex justify-center ps-[calc(var(--spacing)_*_4.5_-_1px)]">
                    <StepperSeparator
                      orientation="vertical"
                      isLast={isLast}
                      state={dataState}
                      disabled={props.disabled}
                    />
                  </div>
                )}
                <div className="my-3 flex-1 ps-4">{panel}</div>
              </div>
            )}
          </>
        );
      },
      Title,
      Description,
      Panel: ({ children, asChild, ...props }) => {
        const Comp = asChild ? Slot : "div";
        const { tracking } = useStepperProvider();

        return (
          <Comp
            date-component="stepper-step-panel"
            ref={(node) => scrollIntoStepperPanel(node, tracking)}
            {...props}
          >
            {children}
          </Comp>
        );
      },
      Controls: ({ children, className, asChild, ...props }) => {
        const Comp = asChild ? Slot : "div";
        return (
          <Comp
            date-component="stepper-controls"
            className={cn("flex justify-end gap-4", className)}
            {...props}
          >
            {children}
          </Comp>
        );
      },
    },
  };
};

const Title = ({
  children,
  className,
  asChild,
  ...props
}: React.ComponentProps<"h4"> & { asChild?: boolean }) => {
  const Comp = asChild ? Slot : "h4";

  return (
    <Comp
      date-component="stepper-step-title"
      className={cn("text-base font-medium", className)}
      {...props}
    >
      {children}
    </Comp>
  );
};

const Description = ({
  children,
  className,
  asChild,
  ...props
}: React.ComponentProps<"p"> & { asChild?: boolean }) => {
  const Comp = asChild ? Slot : "p";

  return (
    <Comp
      date-component="stepper-step-description"
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    >
      {children}
    </Comp>
  );
};

const StepperSeparator = ({
  orientation,
  isLast,
  labelOrientation,
  state,
  disabled,
}: {
  isLast: boolean;
  state: string;
  disabled?: boolean;
} & VariantProps<typeof classForSeparator>) => {
  if (isLast) {
    return null;
  }
  return (
    <div
      date-component="stepper-separator"
      data-orientation={orientation}
      data-state={state}
      data-disabled={Boolean(disabled).toString()}
      role="separator"
      tabIndex={-1}
      className={classForSeparator({ orientation, labelOrientation })}
    />
  );
};

const CircleStepIndicator = ({
  currentStep,
  totalSteps,
  size = 80,
  strokeWidth = 6,
}: CircleStepIndicatorProps) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const fillPercentage = (currentStep / totalSteps) * 100;
  const dashOffset = circumference - (circumference * fillPercentage) / 100;
  return (
    <div
      date-component="stepper-step-indicator"
      role="progressbar"
      aria-valuenow={currentStep}
      aria-valuemin={1}
      aria-valuemax={totalSteps}
      tabIndex={-1}
      className="relative inline-flex items-center justify-center"
    >
      <svg width={size} height={size}>
        <title>Step Indicator</title>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-muted-foreground"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          className="text-primary transition-all duration-300 ease-in-out"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-sm font-medium" aria-live="polite">
          {currentStep} of {totalSteps}
        </span>
      </div>
    </div>
  );
};

const classForNavigationList = cva("flex gap-2", {
  variants: {
    variant: {
      horizontal: "flex-row items-center justify-between",
      vertical: "flex-col",
      circle: "flex-row items-center justify-between",
    },
  },
});

const classForSeparator = cva(
  [
    "bg-muted",
    "data-[state=completed]:bg-primary data-[disabled]:opacity-50",
    "transition-all duration-300 ease-in-out",
  ],
  {
    variants: {
      orientation: {
        horizontal: "h-0.5 flex-1",
        vertical: "h-full w-0.5",
      },
      labelOrientation: {
        vertical:
          "absolute left-[calc(50%+30px)] right-[calc(-50%+20px)] top-5 block shrink-0",
      },
    },
  }
);

function scrollIntoStepperPanel(
  node: HTMLDivElement | null,
  tracking?: boolean
) {
  if (tracking) {
    node?.scrollIntoView({ behavior: "smooth", block: "center" });
  }
}

const useStepChildren = (children: React.ReactNode) => {
  return React.useMemo(() => extractChildren(children), [children]);
};

const extractChildren = (children: React.ReactNode) => {
  const childrenArray = React.Children.toArray(children);
  const map = new Map<string, React.ReactNode>();

  for (const child of childrenArray) {
    if (React.isValidElement(child)) {
      if (child.type === Title) {
        map.set("title", child);
      } else if (child.type === Description) {
        map.set("description", child);
      } else {
        map.set("panel", child);
      }
    }
  }

  return map;
};

const onStepKeyDown = (
  e: React.KeyboardEvent<HTMLButtonElement>,
  nextStep: Stepperize.Step,
  prevStep: Stepperize.Step
) => {
  const { key } = e;
  const directions = {
    next: ["ArrowRight", "ArrowDown"],
    prev: ["ArrowLeft", "ArrowUp"],
  };

  if (directions.next.includes(key) || directions.prev.includes(key)) {
    const direction = directions.next.includes(key) ? "next" : "prev";
    const step = direction === "next" ? nextStep : prevStep;

    if (!step) {
      return;
    }

    const stepElement = document.getElementById(`step-${step.id}`);
    if (!stepElement) {
      return;
    }

    const isActive =
      stepElement.parentElement?.getAttribute("data-state") !== "inactive";
    if (isActive || direction === "prev") {
      stepElement.focus();
    }
  }
};

const getStepState = (currentIndex: number, stepIndex: number) => {
  if (currentIndex === stepIndex) {
    return "active";
  }
  if (currentIndex > stepIndex) {
    return "completed";
  }
  return "inactive";
};

// Type definitions
export type StepperVariant = "horizontal" | "vertical" | "circle";
export type StepperLabelOrientation = "horizontal" | "vertical";

export interface StepperConfigProps {
  variant?: StepperVariant;
  labelOrientation?: StepperLabelOrientation;
  tracking?: boolean;
}

export interface CircleStepIndicatorProps {
  currentStep: number;
  totalSteps: number;
  size?: number;
  strokeWidth?: number;
}

// Status type for steps
export type StepStatus = 'completed' | 'active' | 'locked' | 'incomplete';

// Helper function to get step status
export const getStatus = (step: any, currentStep: any, metadata?: any): StepStatus => {
  if (step.id === currentStep.id) {
    return 'active';
  }
  
  // Check if step is completed based on metadata or other logic
  if (metadata?.completed?.has?.(step.id)) {
    return 'completed';
  }
  
  // Check if step is accessible (not locked)
  if (metadata?.accessible?.has?.(step.id) === false) {
    return 'locked';
  }
  
  return 'incomplete';
};

// Circle index component for step indicators
interface CircleIndexProps {
  index: number;
  status: StepStatus;
  className?: string;
}

const CircleIndex: React.FC<CircleIndexProps> = ({ index, status, className }) => {
  const getIcon = () => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5" />;
      case 'active':
        return <Circle className="h-5 w-5 fill-current" />;
      case 'locked':
        return <Lock className="h-4 w-4" />;
      case 'incomplete':
      default:
        return <span className="text-sm font-medium">{index}</span>;
    }
  };

  return (
    <div className={cn("flex items-center justify-center", className)}>
      {getIcon()}
    </div>
  );
};

// Wizard step tooltip component
interface WizardStepTooltipProps {
  step: any;
  status?: StepStatus;
}

const WizardStepTooltip: React.FC<WizardStepTooltipProps> = ({ step, status }) => {
  const getTooltipContent = () => {
    switch (status) {
      case 'completed':
        return `${step.label || step.title} - Completed`;
      case 'active':
        return `${step.label || step.title} - Current step`;
      case 'locked':
        return `${step.label || step.title} - Complete previous steps to unlock`;
      case 'incomplete':
      default:
        return `${step.label || step.title} - Not yet started`;
    }
  };

  return (
    <div className="max-w-xs">
      <div className="font-medium">{step.label || step.title}</div>
      {step.description && (
        <div className="text-sm text-muted-foreground mt-1">{step.description}</div>
      )}
      <div className="text-xs text-muted-foreground mt-1 opacity-75">
        {getTooltipContent()}
      </div>
    </div>
  );
};

// Enhanced WizardStepper component
interface WizardStepperProps {
  variant?: 'horizontal' | 'mobile';
  className?: string;
  showTooltips?: boolean;
  metadata?: {
    completed?: Set<string>;
    accessible?: Set<string>;
  };
  stepper: any; // Pass stepper instance as prop
}

export const WizardStepper: React.FC<WizardStepperProps> = ({ 
  variant = 'horizontal', 
  className,
  showTooltips = true,
  metadata,
  stepper
}) => {
  if (!stepper) {
    console.warn('WizardStepper requires a stepper instance');
    return null;
  }

  const StepButton = ({ step, idx }: { step: any; idx: number }) => {
    const status = getStatus(step, stepper.current, metadata);
    const isDisabled = status === 'locked';
    
    const stepButton = (
      <stepper.Stepper.Step
        key={step.id}
        of={step.id}
        disabled={isDisabled}
        icon={<CircleIndex index={idx + 1} status={status} />}
        onClick={() => !isDisabled && stepper.goTo?.(step.id)}
        className={cn(
          "transition-all duration-200",
          status === 'active' && "ring-2 ring-primary ring-offset-2",
          status === 'completed' && "bg-primary/10 hover:bg-primary/20",
          status === 'locked' && "opacity-50 cursor-not-allowed",
          "hover:scale-105"
        )}
      >
        <stepper.Stepper.Title className={cn(
          status === 'active' && "font-semibold text-primary",
          status === 'completed' && "text-primary",
          status === 'locked' && "text-muted-foreground"
        )}>
          {step.label || step.title}
        </stepper.Stepper.Title>
      </stepper.Stepper.Step>
    );

    if (!showTooltips) {
      return stepButton;
    }

    return (
      <Tooltip key={step.id}>
        <TooltipTrigger asChild>
          {stepButton}
        </TooltipTrigger>
        <TooltipContent side="bottom" align="center">
          <WizardStepTooltip step={step} status={status} />
        </TooltipContent>
      </Tooltip>
    );
  };

  if (variant === 'mobile') {
    return (
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="sm" className="md:hidden">
            <span>Step {stepper.all.findIndex((s: any) => s.id === stepper.current.id) + 1} of {stepper.all.length}</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-80">
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-4">Navigation</h3>
            <TooltipProvider>
              <stepper.Stepper.Navigation className="flex flex-col space-y-2">
                {stepper.all.map((step: any, idx: number) => (
                  <StepButton key={step.id} step={step} idx={idx} />
                ))}
              </stepper.Stepper.Navigation>
            </TooltipProvider>
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <TooltipProvider>
      <stepper.Stepper.Navigation 
        className={cn(
          "flex overflow-x-auto scrollbar-hide",
          "border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
          "px-4 py-2",
          className
        )}
      >
        {stepper.all.map((step: any, idx: number) => (
          <StepButton key={step.id} step={step} idx={idx} />
        ))}
      </stepper.Stepper.Navigation>
    </TooltipProvider>
  );
};

export type StepperDefineProps<Steps extends Stepperize.Step[]> = Omit<
  Stepperize.StepperReturn<Steps>,
  "Scoped"
> & {
  Stepper: {
    Provider: (
      props: Omit<Stepperize.ScopedProps<Steps>, "children"> &
        Omit<React.ComponentProps<"div">, "children"> &
        StepperConfigProps & {
          children:
            | React.ReactNode
            | ((props: {
                methods: Stepperize.Stepper<Steps>;
              }) => React.ReactNode);
        }
    ) => React.ReactElement;
    Navigation: (props: React.ComponentProps<"nav">) => React.ReactElement;
    Step: (
      props: React.ComponentProps<"button"> & {
        of: Stepperize.Get.Id<Steps>;
        icon?: React.ReactNode;
      }
    ) => React.ReactElement;
    Title: (props: AsChildProps<"h4">) => React.ReactElement;
    Description: (props: AsChildProps<"p">) => React.ReactElement;
    Panel: (props: AsChildProps<"div">) => React.ReactElement;
    Controls: (props: AsChildProps<"div">) => React.ReactElement;
  };
};

type AsChildProps<T extends React.ElementType> = React.ComponentProps<T> & {
  asChild?: boolean;
};

export { defineStepper, WizardStepper };
