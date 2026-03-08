import * as NavigationMenu from "@radix-ui/react-navigation-menu";
import { ChevronDown } from "lucide-react";
import React from "react";
import styled, { css, keyframes } from "styled-components";

// Adapted from https://www.radix-ui.com/primitives/docs/components/navigation-menu

const NavigationMenuRoot = styled(NavigationMenu.Root)`
  display: flex;
  justify-content: center;
  position: relative;
  z-index: 1;
`;

const NavigationMenuList = styled(NavigationMenu.List)`
  background-color: var(--background);
  border-radius: var(--corner-radius);
  display: flex;
  justify-content: center;
  list-style: none;
  margin: 0;
  padding: 0.25rem;
`;

const baseItemStyles = css`
  align-items: center;
  border-radius: var(--corner-radius-sm);
  font-size: 1rem;
  line-height: 1;
  outline: none;
  padding: 0.25rem 1rem;
  user-select: none;

  &:hover {
    background-color: var(--foreground);
  }
`;

const NavigationMenuTrigger = styled(NavigationMenu.Trigger)`
  ${baseItemStyles}
  display: flex;
  gap: 0.125rem;
  justify-content: space-between;
`;

const NavigationMenuLink = styled(NavigationMenu.Link)`
  ${baseItemStyles}
  display: flex;
  height: 100%;
  text-decoration: none;
`;

const enterFromLeft = keyframes`
  from {
    opacity: 0;
    transform: translateX(-200px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

const enterFromRight = keyframes`
  from {
    opacity: 0;
    transform: translateX(200px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

const exitToLeft = keyframes`
  from {
    opacity: 1;
    transform: translateX(0);
  }
  to {
    opacity: 0;
    transform: translateX(-200px);
  }
`;

const exitToRight = keyframes`
  from {
    opacity: 1;
    transform: translateX(0);
  }
  to {
    opacity: 0;
    transform: translateX(200px);
  }
`;

const scaleIn = keyframes`
  from {
    opacity: 0;
    transform: rotateX(-30deg) scale(0.9);
  }
  to {
    opacity: 1;
    transform: rotateX(0deg) scale(1);
  }
`;

const scaleOut = keyframes`
  from {
    opacity: 1;
    transform: rotateX(0deg) scale(1);
  }
  to {
    opacity: 0;
    transform: rotateX(-10deg) scale(0.95);
  }
`;

const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

const fadeOut = keyframes`
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
`;

const NavigationMenuContent = styled(NavigationMenu.Content)`
  animation-duration: 250ms;
  animation-timing-function: ease;
  left: 0;
  position: absolute;
  top: 0;
  width: 100%;

  &[data-motion="from-start"] {
    animation-name: ${enterFromLeft};
  }

  &[data-motion="from-end"] {
    animation-name: ${enterFromRight};
  }

  &[data-motion="to-start"] {
    animation-name: ${exitToLeft};
  }

  &[data-motion="to-end"] {
    animation-name: ${exitToRight};
  }

  @media only screen and (min-width: 600px) {
    width: auto;
  }
`;

const NavigationMenuViewport = styled(NavigationMenu.Viewport)`
  background-color: var(--super-foreground);
  border-radius: var(--corner-radius);
  height: var(--radix-navigation-menu-viewport-height);
  margin-top: 10px;
  overflow: hidden;
  position: relative;
  transform-origin: top center;
  width: 100%;
  box-shadow:
    hsl(206 22% 7% / 35%) 0px 10px 38px -10px,
    hsl(206 22% 7% / 20%) 0px 10px 20px -15px;
  transition:
    width,
    height,
    300ms ease;

  &[data-state="open"] {
    animation: ${scaleIn} 200ms ease;
  }

  &[data-state="closed"] {
    animation: ${scaleOut} 200ms ease;
  }

  @media only screen and (min-width: 600px) {
    width: var(--radix-navigation-menu-viewport-width);
  }
`;

const NavigationMenuIndicator = styled(NavigationMenu.Indicator)`
  align-items: flex-end;
  display: flex;
  height: 10px;
  justify-content: center;
  overflow: hidden;
  top: 100%;
  z-index: 1;
  transition:
    width,
    transform 250ms ease;

  &[data-state="visible"] {
    animation: ${fadeIn} 200ms ease;
  }

  &[data-state="hidden"] {
    animation: ${fadeOut} 200ms ease;
  }

  div {
    background-color: var(--super-foreground);
  }
`;

const List = styled.ul`
  column-gap: 0.5rem;
  display: grid;
  list-style: none;
  margin: 0;
  padding: 15px;

  @media only screen and (min-width: 600px) {
    width: 600px;
    grid-auto-flow: column;
    grid-template-rows: repeat(3, 1fr);
  }
`;

const ListItemLink = styled.a`
  border-radius: var(--corner-radius-sm);
  display: block;
  font-size: 15px;
  line-height: 1;
  outline: none;
  padding: var(--corner-radius-sm);
  text-decoration: none;
  user-select: none;

  &:focus {
    box-shadow: 0 0 0 2px var(--foreground);
  }

  &:hover {
    background-color: var(--foreground);
  }
`;

const ListItemHeading = styled.div`
  font-weight: 500;
  line-height: 1.2;
  margin-bottom: 0.25rem;
`;

const ListItemText = styled.p`
  font-weight: initial;
  line-height: 1.4;
`;

const ViewportPosition = styled.div`
  display: flex;
  justify-content: center;
  left: 0;
  perspective: 2000px;
  position: absolute;
  top: 100%;
  width: 100%;
`;

const Arrow = styled.div`
  background-color: var(--super-foreground);
  border-top-left-radius: 2px;
  height: 10px;
  position: relative;
  top: 70%;
  transform: rotate(45deg);
  width: 10px;
`;

export default function NavMenu() {
  return (
    <NavigationMenuRoot>
      <NavigationMenuList>
        <NavigationMenu.Item>
          <NavigationMenuLink href="/">Home</NavigationMenuLink>
        </NavigationMenu.Item>

        <NavigationMenu.Item>
          <NavigationMenuTrigger>
            Projects <ChevronDown size={18} />
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <List>
              <ListItem title="Favourites" href="/projects">
                My favourite projects I've worked on
              </ListItem>
              <ListItem title="Hobby Projects" href="/projects">
                Projects I've worked on in my own time for myself and for others
              </ListItem>
              <ListItem title="Work & Study" href="/projects">
                Projects I've worked on while working, studying Software
                Engineering, etc.
              </ListItem>
              <ListItem title="Discord" href="/projects">
                Projects that I've made for Discord, including bots, graphics,
                and websites
              </ListItem>
              <ListItem title="Music" href="/projects">
                Music that I've played with various groups
              </ListItem>
            </List>
          </NavigationMenuContent>
        </NavigationMenu.Item>

        <NavigationMenu.Item>
          <NavigationMenuLink className="NavigationMenuLink" href="/cv">
            CV
          </NavigationMenuLink>
        </NavigationMenu.Item>

        <NavigationMenuIndicator>
          <Arrow />
        </NavigationMenuIndicator>
      </NavigationMenuList>

      <ViewportPosition>
        <NavigationMenuViewport />
      </ViewportPosition>
    </NavigationMenuRoot>
  );
}

interface ListItemProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  title?: string;
}

const ListItem = React.forwardRef<HTMLAnchorElement, ListItemProps>(
  ({ className, children, title, ...props }, forwardedRef) => (
    <li>
      <NavigationMenu.Link asChild>
        <ListItemLink {...props} ref={forwardedRef}>
          <ListItemHeading>{title}</ListItemHeading>
          <ListItemText>{children}</ListItemText>
        </ListItemLink>
      </NavigationMenu.Link>
    </li>
  ),
);
