import styled from "styled-components";

const ProfileImage = styled.img`
  width: 100%;
  border-radius: 100%;
  box-shadow: 0 0 0.5rem rgba(0, 0, 0, 0.1);

  @media (max-width: 768px) {
    width: 5rem;
  }
`;

const StyledNameCard = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  gap: 2rem;
  width: 100%;

  @media (max-width: 768px) {
    flex-direction: row;
    justify-content: center;
    gap: 1rem;
  }
`;

const TextWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;

  @media (max-width: 768px) {
    align-items: flex-start;
    gap: 0.25rem;
  }
`;

const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: 800;
`;

const Subtitle = styled.p`
  font-size: 1.25rem;
  font-weight: 500;
`;

export function SJOuNameCard() {
  return (
    <NameCard
      profileImageUrl="/profile-sjou.jpg"
      name="Samuel Ou"
      subtitle="Software Engineer"
    />
  );
}

export function Rocked03NameCard() {
  return <NameCard profileImageUrl="/profile-rocked03.png" name="Rocked03" />;
}

interface NameCardProps {
  profileImageUrl: string;
  name: string;
  subtitle?: string;
}

function NameCard({ profileImageUrl, name, subtitle }: NameCardProps) {
  return (
    <StyledNameCard>
      <ProfileImage src={profileImageUrl} alt={name} />
      <TextWrapper>
        <Title>{name}</Title>
        <Subtitle>{subtitle}</Subtitle>
      </TextWrapper>
    </StyledNameCard>
  );
}
