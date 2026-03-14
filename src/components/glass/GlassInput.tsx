import React from 'react';
import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';

const glassInputVariants = cva(
  // Base styles
  'w-full bg-white/50 dark:bg-slate-800/50 backdrop-blur-[12px] border rounded-xl transition-all duration-200 ease-out placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 disabled:opacity-50 disabled:pointer-events-none',
  {
    variants: {
      size: {
        sm: 'h-9 px-3 text-sm',
        md: 'h-11 px-4 text-base',
        lg: 'h-12 px-4 text-base',
      },
      error: {
        true: 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/20',
        false: 'border-slate-200 dark:border-slate-700 focus:border-indigo-500',
      },
      hasLeftIcon: {
        true: '',
        false: '',
      },
      hasRightIcon: {
        true: '',
        false: '',
      },
    },
    defaultVariants: {
      size: 'md',
      error: false,
      hasLeftIcon: false,
      hasRightIcon: false,
    },
  }
);

export interface GlassInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    Omit<VariantProps<typeof glassInputVariants>, 'error'> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerClassName?: string;
}

const GlassInput = React.forwardRef<HTMLInputElement, GlassInputProps>(
  (
    {
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      className,
      containerClassName,
      size = 'md',
      type = 'text',
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = React.useState(false);
    const isPassword = type === 'password';
    const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

    const paddingClasses = {
      sm: {
        left: leftIcon ? 'pl-9' : 'pl-3',
        right: rightIcon || isPassword ? 'pr-9' : 'pr-3',
      },
      md: {
        left: leftIcon ? 'pl-11' : 'pl-4',
        right: rightIcon || isPassword ? 'pr-11' : 'pr-4',
      },
      lg: {
        left: leftIcon ? 'pl-11' : 'pl-4',
        right: rightIcon || isPassword ? 'pr-11' : 'pr-4',
      },
    };

    return (
      <div className={cn('w-full', containerClassName)}>
        {label && (
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
            {label}
            {props.required && (
              <span className="text-rose-500 ml-0.5">*</span>
            )}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className={cn(
              'absolute left-0 top-0 h-full flex items-center justify-center text-slate-400 dark:text-slate-500',
              size === 'sm' ? 'w-9' : 'w-11'
            )}>
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            type={inputType}
            className={cn(
              glassInputVariants({ size, error: !!error }),
              paddingClasses[size!].left,
              paddingClasses[size!].right,
              className
            )}
            {...props}
          />
          {(rightIcon || isPassword) && (
            <div className={cn(
              'absolute right-0 top-0 h-full flex items-center justify-center',
              size === 'sm' ? 'w-9' : 'w-11'
            )}>
              {isPassword ? (
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-400 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              ) : (
                <span className="text-slate-400 dark:text-slate-500">
                  {rightIcon}
                </span>
              )}
            </div>
          )}
        </div>
        {(error || helperText) && (
          <div className="mt-1.5 flex items-start gap-1.5">
            {error && (
              <>
                <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-rose-500">{error}</p>
              </>
            )}
            {!error && helperText && (
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {helperText}
              </p>
            )}
          </div>
        )}
      </div>
    );
  }
);

GlassInput.displayName = 'GlassInput';

export { GlassInput, glassInputVariants };
