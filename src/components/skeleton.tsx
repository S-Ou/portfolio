import React from "react";
import styled, { css, keyframes } from "styled-components";

// Adapted from https://github.com/radix-ui/themes/blob/main/packages/radix-ui-themes/src/components/skeleton.tsx
//          and https://github.com/radix-ui/themes/blob/main/packages/radix-ui-themes/src/components/skeleton.css

type SkeletonProps = React.ComponentPropsWithoutRef<"span"> & {
  loading?: boolean;
};

const pulse = keyframes`
  from {
    background-color: rgba(var(--text-color-rgb), 0.08);
  }
  to {
    background-color: rgba(var(--text-color-rgb), 0.16);
  }
`;

const Root = styled.span<{ $inline: boolean }>`
  border-radius: var(--corner-radius-sm);
  animation: ${pulse} 1000ms infinite alternate-reverse;
  background-image: none;
  background-clip: border-box;
  border: none;
  box-shadow: none;
  box-decoration-break: clone;
  color: transparent;
  outline: none;
  pointer-events: none;
  user-select: none;
  cursor: default;

  ${({ $inline }) =>
    $inline &&
    css`
      line-height: 0;
      font-family: Arial, sans-serif;
    `}

  &:empty {
    display: block;
    height: 0.75rem;
  }

  > *,
  &::after,
  &::before {
    visibility: hidden;
  }
`;

export const Skeleton = React.forwardRef<HTMLSpanElement, SkeletonProps>(
  ({ children, loading = true, className, ...props }, forwardedRef) => {
    if (!loading) {
      return <>{children}</>;
    }

    const inline = !React.isValidElement(children);

    return (
      <Root
        ref={forwardedRef}
        aria-hidden
        className={className}
        data-inline-skeleton={inline || undefined}
        tabIndex={-1}
        $inline={inline}
        {...props}
      >
        {children}
      </Root>
    );
  },
);

Skeleton.displayName = "Skeleton";
