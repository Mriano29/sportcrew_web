import { ReactNode } from "react";

interface MainContainerProps {
    children?: ReactNode;
}

export const MainContainer: React.FC<MainContainerProps> = ({ children }) => {
    return (
        <main className="bg-gradient-to-br from-[#C1E8F5] to-[#FF7281] h-screen flex flex-row items-center justify-center p-10">
            {children}
        </main>
    );
};