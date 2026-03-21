import { Clock, Code, Mail, MapPin } from "lucide-react";
import {
  GitHubIcon,
  LetterboxdIcon,
  MarvelDiscordIcon,
  SteamIcon,
} from "@/utils/icons";
import { useEffect, useState } from "react";
import {
  StyledInfoTable,
  StyledLinkButtons,
  InfoBlockDiv,
  LinkButton,
  type InfoBlockProps,
  NameCardSection,
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
            <MapPin size={20} />
          </td>
          <td>Auckland, New Zealand</td>
        </tr>
        <tr>
          <td>
            <Code size={20} />
          </td>
          <td>Professional Software Developer</td>
        </tr>
        <tr>
          <td>
            <MarvelDiscordIcon size={20} />
          </td>
          <td>Marvel Discord Manager</td>
        </tr>
        <tr>
          <td>
            <Clock size={20} />
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
      <LinkButton href="https://github.com/Rocked03">
        <GitHubIcon size={24} />
      </LinkButton>
      <LinkButton href="https://steamcommunity.com/id/rocked03/">
        <SteamIcon size={24} />
      </LinkButton>
      <LinkButton href="https://letterboxd.com/rocked03/">
        <LetterboxdIcon size={24} />
      </LinkButton>
      <LinkButton href="mailto:me@rocked03.dev">
        <Mail size={24} />
      </LinkButton>
      <LinkButton href="https://marvelcord.com/">
        <MarvelDiscordIcon size={24} />
      </LinkButton>
    </StyledLinkButtons>
  );
}

export default function InfoBlockRocked03({
  NameCardComponent,
}: InfoBlockProps) {
  return (
    <InfoBlockDiv>
      <NameCardSection>
        <NameCardComponent />
      </NameCardSection>
      <InfoTable />
      <LinkButtons />
      <Copyright name="Rocked03" />
    </InfoBlockDiv>
  );
}
