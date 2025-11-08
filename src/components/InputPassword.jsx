import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Button from '@/components/Button';
import { t } from "@/i18n";

export default function InputPassword({
  value,
  onChange,
  placeholder = t('writePassword'),
  minLength = 8,
  required = true,
  ...props
}) {
  const [show, setShow] = useState(false);
  const [capsOn, setCapsOn] = useState(false);

  return (
    <div className="relative">
      <input
        type={show ? "text" : "password"}
        value={value}
        onChange={onChange}
        required={required}
        minLength={minLength}
        spellCheck={false}
        autoCapitalize="off"
        style={{ textTransform: "none" }}
        placeholder={placeholder}
        onKeyDown={(e) => setCapsOn(e.getModifierState("CapsLock"))}
        onKeyUp={(e) => setCapsOn(e.getModifierState("CapsLock"))}
        onBlur={() => setCapsOn(false)}
        className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 pr-20
        text-base outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
        {...props}
      />
      <Button
        type="button"
        onClick={() => setShow(!show)}
        className="absolute inset-y-0 right-0 my-1 mr-1 rounded-md px-3 text-sm text-gray-600 hover:bg-gray-100"
        aria-pressed={show}
        aria-label={show ? t('hidePassword') : t('showPassword')}
      >
        {show ? t('hide') : t('show')}
      </Button>
      <AnimatePresence>
        {capsOn && (
          <motion.div
            key="caps"
            role="status"
            aria-live="polite"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.18 }}
            className="absolute -bottom-5 left-0 text-xs text-yellow-700"
          >
            t('warnCapsLock')
          </motion.div>
        )}
      </AnimatePresence>


      {/* Reserver plass så ikke layout hopper hvis du foretrekker det: */}
      <div className="h-4" aria-hidden="true" />

    </div>
  );
}
