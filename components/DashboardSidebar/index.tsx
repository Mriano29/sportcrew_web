interface SideBarProps {

}

export const Sidebar: React.FC<SideBarProps> = ({ }) => {
    return (
        <div className="flex">
            <div className="h-screen w-64 bg-gray-800 text-white p-4">
                <h2 className="text-2xl font-bold mb-6">Sidebar</h2>
                <ul>
                    <li className="mb-4">
                        <a href="#" className="hover:text-gray-400">Home</a>
                    </li>
                    <li className="mb-4">
                        <a href="#" className="hover:text-gray-400">About</a>
                    </li>
                    <li className="mb-4">
                        <a href="#" className="hover:text-gray-400">Services</a>
                    </li>
                    <li className="mb-4">
                        <a href="#" className="hover:text-gray-400">Contact</a>
                    </li>
                </ul>
            </div>
            <div className="flex-1 p-6">
                <h1 className="text-3xl font-bold">Main Content</h1>
            </div>
        </div>
    );
};