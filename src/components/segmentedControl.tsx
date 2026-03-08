// Adapted from Radix UI Themes SegmentedControl
// https://github.com/radix-ui/themes/blob/main/packages/radix-ui-themes/src/components/segmented-control.tsx

import * as React from "react";
import * as ToggleGroupPrimitive from "@radix-ui/react-toggle-group";
import styled, { css } from "styled-components";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface IndicatorState {
  left: number;
  width: number;
  ready: boolean;
}

interface IndicatorContextValue {
  setIndicator: React.Dispatch<React.SetStateAction<IndicatorState>>;
}

interface RootProps extends Omit<
  React.ComponentPropsWithoutRef<typeof ToggleGroupPrimitive.Root>,
  "type" | "rovingFocus"
> {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
}

interface ItemProps extends Omit<
  React.ComponentPropsWithoutRef<typeof ToggleGroupPrimitive.Item>,
  "value"
> {
  value: string;
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

const IndicatorContext = React.createContext<IndicatorContextValue | null>(
  null,
);

// ---------------------------------------------------------------------------
// Styled primitives
// ---------------------------------------------------------------------------

const StyledRoot = styled(ToggleGroupPrimitive.Root)`
  display: inline-flex;
  position: relative;
  background-color: var(--background);
  border-radius: 0.5rem;
  padding: 2px;
  width: fit-content;
`;

interface StyledIndicatorProps {
  $left: number;
  $width: number;
  $ready: boolean;
}

const StyledIndicator = styled.span<StyledIndicatorProps>`
  background-color: var(--foreground);
  border-radius: 0.4rem;
  bottom: 2px;
  left: ${({ $left }) => $left}px;
  pointer-events: none;
  position: absolute;
  top: 2px;
  width: ${({ $width }) => $width}px;
  z-index: 0;
  box-shadow:
    0 1px 3px rgba(0, 0, 0, 0.15),
    0 1px 2px rgba(0, 0, 0, 0.1);

  ${({ $ready }) =>
    $ready &&
    css`
      transition:
        left 200ms cubic-bezier(0.4, 0, 0.2, 1),
        width 200ms cubic-bezier(0.4, 0, 0.2, 1);
    `}
`;

const StyledItem = styled(ToggleGroupPrimitive.Item)`
  align-items: center;
  all: unset;
  border-radius: 0.4rem;
  box-sizing: border-box;
  color: rgba(var(--text-color-rgb), 0.5);
  cursor: pointer;
  display: inline-flex;
  font-size: 13px;
  height: 32px;
  justify-content: center;
  line-height: 1;
  padding: 0 10px;
  position: relative;
  transition: color 150ms ease;
  user-select: none;
  white-space: nowrap;
  z-index: 1;

  &:focus-visible {
    outline: 2px solid var(--text-color);
    outline-offset: 2px;
  }

  &[data-state="on"] {
    color: rgba(var(--text-color-rgb), 0.9);
  }

  &:hover:not([data-state="on"]) {
    color: rgba(var(--text-color-rgb), 0.7);
  }
`;

// Bold-ghost trick: two spans stacked via inline-grid so the container always
// reserves the bold width, preventing layout shift on selection.
const StyledLabelWrapper = styled.span`
  display: inline-grid;
  place-items: center;
`;

const StyledLabelGhost = styled.span`
  visibility: hidden;
  font-weight: 600;
  grid-area: 1 / 1;
  pointer-events: none;
`;

const StyledLabelVisible = styled.span`
  grid-area: 1 / 1;
  font-weight: 400;
  transition: font-weight 150ms ease;

  ${StyledItem}[data-state='on'] & {
    font-weight: 600;
  }
`;

// ---------------------------------------------------------------------------
// Root
// ---------------------------------------------------------------------------

const Root = React.forwardRef<HTMLDivElement, RootProps>(
  (
    { value: valueProp, defaultValue = "", onValueChange, children, ...props },
    ref,
  ) => {
    const [value, setValue] = React.useState(defaultValue);

    React.useEffect(() => {
      if (valueProp !== undefined) setValue(valueProp);
    }, [valueProp]);

    const handleValueChange = React.useCallback(
      (next: string) => {
        if (!next) return; // ignore deselect clicks
        setValue(next);
        onValueChange?.(next);
      },
      [onValueChange],
    );

    const [indicator, setIndicator] = React.useState<IndicatorState>({
      left: 0,
      width: 0,
      ready: false,
    });

    return (
      <IndicatorContext.Provider value={{ setIndicator }}>
        <StyledRoot
          ref={ref}
          type="single"
          value={value}
          onValueChange={handleValueChange}
          rovingFocus={false}
          data-sc-root
          {...props}
        >
          <StyledIndicator
            aria-hidden
            $left={indicator.left}
            $width={indicator.width}
            $ready={indicator.ready}
          />
          {children}
        </StyledRoot>
      </IndicatorContext.Provider>
    );
  },
);

Root.displayName = "SegmentedControl.Root";

// ---------------------------------------------------------------------------
// Item
// ---------------------------------------------------------------------------

const Item = React.forwardRef<HTMLButtonElement, ItemProps>(
  ({ value, children, ...props }, forwardedRef) => {
    const ctx = React.useContext(IndicatorContext);
    const itemRef = React.useRef<HTMLButtonElement>(null);

    const ref = React.useCallback(
      (node: HTMLButtonElement | null) => {
        (itemRef as React.MutableRefObject<HTMLButtonElement | null>).current =
          node;
        if (typeof forwardedRef === "function") forwardedRef(node);
        else if (forwardedRef)
          (forwardedRef as React.RefObject<HTMLButtonElement | null>).current =
            node;
      },
      [forwardedRef],
    );

    const updateIndicator = React.useCallback(() => {
      const el = itemRef.current;
      if (!el || !ctx) return;
      if (el.getAttribute("data-state") !== "on") return;

      const root = el.closest("[data-sc-root]") as HTMLElement | null;
      if (!root) return;

      const { left: rootLeft } = root.getBoundingClientRect();
      const { left: itemLeft, width } = el.getBoundingClientRect();

      const left = itemLeft - rootLeft;

      ctx.setIndicator((prev) =>
        prev.left === left && prev.width === width
          ? prev
          : { left, width, ready: prev.ready },
      );
    }, [ctx]);

    // Snap indicator on mount, then enable transitions after first paint.
    React.useLayoutEffect(() => {
      if (!ctx) return;
      updateIndicator();
      const id = requestAnimationFrame(() =>
        ctx.setIndicator((prev) => ({ ...prev, ready: true })),
      );
      return () => cancelAnimationFrame(id);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Keep indicator accurate on resize.
    React.useEffect(() => {
      const el = itemRef.current;
      if (!el) return;
      const ro = new ResizeObserver(updateIndicator);
      ro.observe(el);
      return () => ro.disconnect();
    }, [updateIndicator]);

    // Reposition when this item becomes active.
    React.useEffect(() => {
      const el = itemRef.current;
      if (!el) return;
      const mo = new MutationObserver(updateIndicator);
      mo.observe(el, { attributes: true, attributeFilter: ["data-state"] });
      return () => mo.disconnect();
    }, [updateIndicator]);

    return (
      <StyledItem ref={ref} value={value} {...props}>
        <StyledLabelWrapper>
          <StyledLabelGhost aria-hidden>{children}</StyledLabelGhost>
          <StyledLabelVisible>{children}</StyledLabelVisible>
        </StyledLabelWrapper>
      </StyledItem>
    );
  },
);

Item.displayName = "SegmentedControl.Item";

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

export const SegmentedControl = { Root, Item };

// Named styled exports for overriding via styled(SegmentedControl.Root) etc.
export {
  StyledRoot as SegmentedControlRoot,
  StyledItem as SegmentedControlItem,
};
