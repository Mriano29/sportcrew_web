import { ReactNode } from "react";

interface MainContainerProps {
    children?: ReactNode;
}

export const MainContainer: React.FC<MainContainerProps> = ({ children }) => {
    return (
        <main className="h-screen flex flex-row items-center justify-center">
            {children}
        </main>
    );
};