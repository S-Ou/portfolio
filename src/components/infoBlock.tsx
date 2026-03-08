import styled from "styled-components";
import { BlockDiv } from "./commonStyles";
import Line from "./line";
import {
  Briefcase,
  Clock,
  GraduationCap,
  Mail,
  MapPin,
  University,
} from "lucide-react";
import { GitHubIcon, HalaStarIcon, LinkedInIcon } from "@/utils/icons";
import { useEffect, useState } from "react";

const InfoBlockDiv = styled(BlockDiv)`
  display: flex;
  flex-direction: column;
  gap: 2rem;
  align-items: center;
`;

const ProfileImage = styled.img`
  width: 100%;
  border-radius: 9999px;
`;

const NameCard = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  width: 100%;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: 800;
`;

const Subtitle = styled.p`
  font-size: 1.25rem;
  font-weight: 500;
`;

const StyledInfoTable = styled.table`
  border-collapse: separate;
  border-spacing: 0.5rem 0.5rem;
  margin: -1rem -1rem;
  width: 100%;

  td {
    vertical-align: middle;
  }

  td:first-child {
    align-items: center;
    display: flex;
    justify-content: center;
    height: 2rem;
  }
`;

const StyledLinkButtons = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 1rem;
`;

const StyledLinkButton = styled.a`
  aspect-ratio: 1 / 1;
`;

function InfoTable() {
  const [currentTime, setCurrentTime] = useState<string>("");

  useEffect(() => {
    const updateTime = () => {
      setCurrentTime(
        new Date().toLocaleTimeString([], {
          month: "short",
          day: "numeric",
          hour: "numeric",
          minute: "numeric",
          hour12: true,
          timeZone: "Pacific/Auckland",
          timeZoneName: "short",
        }),
      );
    };

    updateTime();
    const interval = setInterval(updateTime, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  return (
    <StyledInfoTable>
      <tbody>
        <tr>
          <td>
            <MapPin size={24} />
          </td>
          <td>Auckland, New Zealand</td>
        </tr>
        <tr>
          <td>
            <GraduationCap size={24} />
          </td>
          <td>Bachelor of Engineering BE(Hons)</td>
        </tr>
        <tr>
          <td>
            <University size={24} />
          </td>
          <td>University of Auckland</td>
        </tr>
        <tr>
          <td>
            <Briefcase size={24} />
          </td>
          <td>Vista Group</td>
        </tr>
        <tr>
          <td>
            <Clock size={24} />
          </td>
          <td>{currentTime || "Loading..."}</td>
        </tr>
      </tbody>
    </StyledInfoTable>
  );
}

function LinkButtons() {
  return (
    <StyledLinkButtons>
      <LinkButton href="https://github.com/S-Ou">
        <GitHubIcon size={24} />
      </LinkButton>
      <LinkButton href="https://www.linkedin.com/in/samuel-ou/">
        <LinkedInIcon size={24} />
      </LinkButton>
      <LinkButton href="mailto:me@sjou.dev">
        <Mail size={24} />
      </LinkButton>
      <LinkButton href="https://rocked03.dev">
        <HalaStarIcon size={24} />
      </LinkButton>
    </StyledLinkButtons>
  );
}

function LinkButton({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <StyledLinkButton href={href} target="_blank" rel="noopener noreferrer">
      {children}
    </StyledLinkButton>
  );
}

export default function InfoBlock() {
  return (
    <InfoBlockDiv>
      <ProfileImage src="/profile.jpg" alt="Your Name" />
      <NameCard>
        <Title>Samuel Ou</Title>
        <Subtitle>Software Engineer</Subtitle>
      </NameCard>
      <Line />
      <InfoTable />
      <Line />
      <LinkButtons />
    </InfoBlockDiv>
  );
}
