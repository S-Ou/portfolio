import styled, { keyframes, css } from "styled-components";
import { useEffect, useState } from "react";

const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

const ProfileImage = styled.img`
  aspect-ratio: 1 / 1;
  border-radius: 100%;
  box-shadow: 0 0 0.5rem rgba(0, 0, 0, 0.1);
  display: block;
  object-fit: cover;
  width: 100%;

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

const Subtitle = styled.p<{ $isDynamic: boolean }>`
  font-size: 1.25rem;
  font-weight: 500;
  text-align: center;
  width: 100%;
  line-height: 1.2;
  min-height: 1.2rem;

  ${({ $isDynamic }) =>
    $isDynamic &&
    css`
      animation: ${fadeIn} 0.5s ease-in;
      cursor: default;
    `}
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
  var subtitles = [
    "Comic Reader",
    "Community Manager",
    "Jazz Musician",
    "Marvelite",
    "Mediocre Gamer",
    "Movie Consumer",
    "Pro Software Dev",
    "Proud Kiwi",
  ];

  return (
    <NameCard
      profileImageUrl="/profile-rocked03.png"
      name="Rocked03"
      subtitle={subtitles}
    />
  );
}

interface NameCardProps {
  profileImageUrl: string;
  name: string;
  subtitle?: string | string[];
}

function NameCard({ profileImageUrl, name, subtitle }: NameCardProps) {
  const isSubtitleArray = Array.isArray(subtitle);
  const [displayedSubtitle, setDisplayedSubtitle] = useState<string>(() =>
    !isSubtitleArray && subtitle ? subtitle : "",
  );

  const handleSubtitleHover = () => {
    if (isSubtitleArray && subtitle.length > 0) {
      const randomSubtitle =
        subtitle[Math.floor(Math.random() * subtitle.length)];
      setDisplayedSubtitle(randomSubtitle);
    }
  };

  useEffect(() => {
    handleSubtitleHover();
  }, [subtitle]);

  return (
    <StyledNameCard>
      <ProfileImage src={profileImageUrl} alt={name} />
      <TextWrapper>
        <Title>{name}</Title>
        {(displayedSubtitle || isSubtitleArray) && (
          <Subtitle
            $isDynamic={isSubtitleArray}
            key={displayedSubtitle}
            onClick={handleSubtitleHover}
            onMouseEnter={handleSubtitleHover}
          >
            {displayedSubtitle || (isSubtitleArray ? "\u00A0" : "")}
          </Subtitle>
        )}
      </TextWrapper>
    </StyledNameCard>
  );
}
