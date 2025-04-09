//Types
interface ProfileLabelProps {
  title: string;
  value?: string | number;
}

export const ProfileLabel: React.FC<ProfileLabelProps> = ({ title, value }) => {
  return (
    <div className="flex flex-col items-center">
      <h1 className="text-center text-2xl font-bold">{title}</h1>
      <h1 className="text-center text-xl font-bold">{value}</h1>
    </div>
  );
};
