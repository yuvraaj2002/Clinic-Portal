'use client';

import * as React from 'react';
import { cn } from '../../lib/utils';

// Tabs Component
type TabsContextType<T extends string> = {
    activeValue: T;
    handleValueChange: (value: T) => void;
};

const TabsContext = React.createContext<TabsContextType<any> | undefined>(
    undefined,
);

function useTabs<T extends string = string>(): TabsContextType<T> {
    const context = React.useContext(TabsContext);
    if (!context) {
        throw new Error('useTabs must be used within a TabsProvider');
    }
    return context;
}

type BaseTabsProps = React.ComponentProps<'div'> & {
    children: React.ReactNode;
};

type UnControlledTabsProps<T extends string = string> = BaseTabsProps & {
    defaultValue?: T;
    value?: never;
    onValueChange?: never;
};

type ControlledTabsProps<T extends string = string> = BaseTabsProps & {
    value: T;
    onValueChange?: (value: T) => void;
    defaultValue?: never;
};

type TabsProps<T extends string = string> =
    | UnControlledTabsProps<T>
    | ControlledTabsProps<T>;

function Tabs<T extends string = string>({
    defaultValue,
    value,
    onValueChange,
    children,
    className,
    ...props
}: TabsProps<T>) {
    const [activeValue, setActiveValue] = React.useState<T | undefined>(
        defaultValue ?? undefined,
    );
    const isControlled = value !== undefined;

    const handleValueChange = (val: T) => {
        if (!isControlled) setActiveValue(val);
        else onValueChange?.(val);
    };

    return (
        <TabsContext.Provider
            value={{
                activeValue: (value ?? activeValue)!,
                handleValueChange,
            }}
        >
            <div
                data-slot="tabs"
                className={cn('flex flex-col gap-2', className)}
                {...props}
            >
                {children}
            </div>
        </TabsContext.Provider>
    );
}

type TabsListProps = React.ComponentProps<'div'> & {
    children: React.ReactNode;
};

function TabsList({
    children,
    className,
    ...props
}: TabsListProps) {
    return (
        <div
            role="tablist"
            data-slot="tabs-list"
            className={cn(
                'inline-flex h-10 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground',
                className,
            )}
            {...props}
        >
            {children}
        </div>
    );
}

type TabsTriggerProps = React.ComponentProps<'button'> & {
    value: string;
    children: React.ReactNode;
};

function TabsTrigger({
    value,
    children,
    className,
    ...props
}: TabsTriggerProps) {
    const { activeValue, handleValueChange } = useTabs();

    return (
        <button
            data-slot="tabs-trigger"
            role="tab"
            onClick={() => handleValueChange(value)}
            data-state={activeValue === value ? 'active' : 'inactive'}
            className={cn(
                'inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm',
                className,
            )}
            {...props}
        >
            {children}
        </button>
    );
}

type TabsContentProps = React.ComponentProps<'div'> & {
    value: string;
    children: React.ReactNode;
};

function TabsContent({
    children,
    value,
    className,
    ...props
}: TabsContentProps) {
    const { activeValue } = useTabs();
    const isActive = activeValue === value;

    if (!isActive) return null;

    return (
        <div
            role="tabpanel"
            data-slot="tabs-content"
            className={cn(
                'mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
}

export {
    Tabs,
    TabsList,
    TabsTrigger,
    TabsContent,
    useTabs,
    type TabsContextType,
    type TabsProps,
    type TabsListProps,
    type TabsTriggerProps,
    type TabsContentProps,
};
