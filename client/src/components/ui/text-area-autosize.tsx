import { forwardRef, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { Textarea, TextareaProps } from "@/components/ui/textarea";

export interface TextareaAutosizeProps extends TextareaProps {
  maxRows?: number;
  minRows?: number;
}

const TextareaAutosize = forwardRef<HTMLTextAreaElement, TextareaAutosizeProps>(
  ({ className, maxRows = 5, minRows = 1, onChange, ...props }, ref) => {
    const textareaRef = useRef<HTMLTextAreaElement | null>(null);
    
    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const textarea = textareaRef.current;
      if (!textarea) return;
      
      textarea.style.height = 'auto';
      
      const currentScrollHeight = textarea.scrollHeight;
      const lineHeight = parseInt(window.getComputedStyle(textarea).lineHeight);
      const paddingTop = parseInt(window.getComputedStyle(textarea).paddingTop);
      const paddingBottom = parseInt(window.getComputedStyle(textarea).paddingBottom);
      const totalPadding = paddingTop + paddingBottom;
      
      const minHeight = (lineHeight * minRows) + totalPadding;
      const maxHeight = maxRows ? (lineHeight * maxRows) + totalPadding : Infinity;
      
      const newHeight = Math.min(Math.max(currentScrollHeight, minHeight), maxHeight);
      textarea.style.height = `${newHeight}px`;
      
      onChange?.(e);
    };
    
    // Initial height adjustment
    useEffect(() => {
      const textarea = textareaRef.current;
      if (!textarea) return;
      
      const lineHeight = parseInt(window.getComputedStyle(textarea).lineHeight);
      const paddingTop = parseInt(window.getComputedStyle(textarea).paddingTop);
      const paddingBottom = parseInt(window.getComputedStyle(textarea).paddingBottom);
      const totalPadding = paddingTop + paddingBottom;
      
      const minHeight = (lineHeight * minRows) + totalPadding;
      textarea.style.height = `${minHeight}px`;
    }, [minRows]);
    
    return (
      <Textarea
        ref={(element) => {
          textareaRef.current = element;
          if (typeof ref === 'function') {
            ref(element);
          } else if (ref) {
            ref.current = element;
          }
        }}
        className={cn("overflow-hidden", className)}
        onChange={handleChange}
        {...props}
      />
    );
  }
);

TextareaAutosize.displayName = "TextareaAutosize";

export { TextareaAutosize };
