import * as React from "react";

/**
 * Centered top-bar tab navigation with a raised molded active pill.
 *
 * @startingPoint section="Components" subtitle="Top-bar tab nav with active indicator" viewport="700x120"
 */
export interface TabBarProps {
  /** Tabs, in order. `icon` is an optional Icon name. */
  tabs: Array<{ key: string; label: string; icon?: string }>;
  /** Key of the active tab. */
  active: string;
  onChange?: (key: string) => void;
  className?: string;
  style?: React.CSSProperties;
}
export declare function TabBar(props: TabBarProps): React.JSX.Element;
