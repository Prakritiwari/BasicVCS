import { Link } from "react-router-dom";
import Chip from "../ui/Chip";
import Icon from "../ui/Icon";
import { formatDate, repoDate } from "../../utils/format";
import "./repo-card.css";

export default function RepoCard({ repo, index = 0 }) {
  const isPublic = Boolean(repo?.visibility);
  const date = repoDate(repo);

  return (
    <Link
      to={`/repo/${repo._id}`}
      className="repo-card"
      style={{ animationDelay: `${Math.min(index * 45, 220)}ms` }}
    >
      <div className="repo-card-top">
        <span className="repo-glyph" aria-hidden="true">
          <Icon name="repos" size={19} />
        </span>
        <Chip dot={isPublic ? "green" : "amber"} tone={isPublic ? "sage" : "butter"}>
          {isPublic ? "Public" : "Private"}
        </Chip>
      </div>

      <h3>{repo.name}</h3>
      <p>{repo.description || "No description yet. Add one when you edit the repo."}</p>

      <div className="repo-card-foot">
        <span className="mono repo-date">
          <Icon name="clock" size={12} />
          {date ? formatDate(date) : "No date"}
        </span>
        <span className="repo-open mono">
          Open <Icon name="arrow" size={12} />
        </span>
      </div>
    </Link>
  );
}
