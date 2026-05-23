import { ChangeEventHandler, HTMLInputTypeAttribute, useState } from 'react';
import clsx from 'clsx';

interface InputProperties {
  type: HTMLInputTypeAttribute;
  placeholder: string;
  value: string;
  onChange: ChangeEventHandler<HTMLInputElement>;
  isRequired?: boolean;
  autoComplete?: string;
}

export const Input = ({
  type,
  placeholder,
  value,
  onChange,
  isRequired = false,
  autoComplete,
}: InputProperties) => {
  const [isFocused, setIsFocused] = useState(false);
  const shouldFloat = isFocused || value.length > 0;

  return (
    <div className="relative w-full mb-6">
      <div
        className={clsx(
          'relative w-full rounded-xl border-2 transition-all duration-200',
          shouldFloat ? 'border-green-600' : 'border-gray-400',
        )}
      >
        {/* Floating label that cuts the border */}
        <span
          className={clsx(
            'absolute left-4 px-1 transition-all duration-200 text-sm pointer-events-none z-0',
            shouldFloat
              ? '-top-2 text-gray-400 text-xs bg-gray-100 rounded-md border border-green-600 border'
              : 'top-1/2 -translate-y-1/2 text-gray-400 bg-transparent',
          )}
        >
          {placeholder}
        </span>

        {/* Input field */}
        <input
          type={type}
          value={value}
          onChange={onChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          required={isRequired}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className="w-full px-4 pt-5 pb-2 bg-transparent text-gray-700 placeholder-transparent rounded-xl focus:outline-none"
        />
      </div>
    </div>
  );
};
