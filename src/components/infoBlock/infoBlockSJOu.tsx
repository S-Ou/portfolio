import Line from "../line";
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
import {
  StyledInfoTable,
  StyledLinkButtons,
  InfoBlockDiv,
  NameCardSection,
  LinkButton,
  type InfoBlockProps,
} from "./infoBlock";
import Copyright from "../copyright";

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
    const interval = setInterval(updateTime, 10000); // Update every 10s

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

export default function InfoBlockSJOu({ NameCardComponent }: InfoBlockProps) {
  return (
    <InfoBlockDiv>
      <NameCardSection>
        <NameCardComponent />
        <Line />
      </NameCardSection>
      <InfoTable />
      <Line />
      <LinkButtons />
      <Copyright name="Samuel Ou" />
    </InfoBlockDiv>
  );
}
