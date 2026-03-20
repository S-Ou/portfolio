import styled from "styled-components";

const ProfileImage = styled.img`
  width: 100%;
  border-radius: 100%;
  box-shadow: 0 0 0.5rem rgba(0, 0, 0, 0.1);
`;

const StyledNameCard = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  gap: 2rem;
  width: 100%;
`;

const TextWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: 800;
`;

const Subtitle = styled.p`
  font-size: 1.25rem;
  font-weight: 500;
`;

interface NameCardProps {
  profileImageUrl: string;
  name: string;
  subtitle?: string;
}

export default function NameCard({
  profileImageUrl,
  name,
  subtitle,
}: NameCardProps) {
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
