import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./authContext";
import { ToastProvider } from "./components/ui/Toast";
import Landing from "./components/landing/Landing";
import Login from "./components/auth/Login";
import Signup from "./components/auth/Signup";
import Dashboard from "./components/dashboard/Dashboard";
import RepoDetail from "./components/repo/RepoDetail";
import Profile from "./components/user/Profile";
import api from "./api";

vi.mock("./api", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

const user = {
  username: "tester",
  email: "tester@example.com",
  repositories: [],
  starRepos: ["star-1"],
  followedUsers: ["follow-1", "follow-2"],
};

const repo = {
  _id: "64b7f0c2f1a2b3c4d5e6f789",
  name: "my-project",
  description: "owned by me",
  visibility: false,
  owner: "test-user",
  content: ["README.md", "src/index.js"],
};

const communityRepo = {
  _id: "64b7f0c2f1a2b3c4d5e6f790",
  name: "community-project",
  description: "somebody else's work",
  visibility: true,
  owner: { _id: "other-user", username: "someone" },
};

const commit = {
  id: "24ec974b-7848-4606-8aea-66eeffb53ba4",
  message: "first commit",
  date: "2026-11-14T10:00:00.000Z",
  files: ["README.md", "src/index.js"],
};

function renderAt(ui, path = "/") {
  return render(
    <AuthProvider>
      <ToastProvider>
        <MemoryRouter initialEntries={[path]}>{ui}</MemoryRouter>
      </ToastProvider>
    </AuthProvider>
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
  localStorage.setItem("userId", "test-user");
  localStorage.setItem("token", "test-token");
});

describe("landing", () => {
  it("renders the hero and the six-command story", () => {
    renderAt(<Landing />);
    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading.textContent).toContain("Version control");
    expect(screen.getByRole("heading", { name: /six commands/i })).toBeTruthy();
    expect(screen.getByText(/Stop losing/)).toBeTruthy();
  });
});

describe("auth", () => {
  it("renders the login card and stores the session", async () => {
    api.post.mockResolvedValue({ data: { token: "jwt", userId: "test-user" } });
    renderAt(<Login />, "/auth");

    expect(screen.getByText("Welcome back.")).toBeTruthy();
    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "tester@example.com" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "secret" },
    });
    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(localStorage.getItem("token")).toBe("jwt");
    });
  });

  it("renders the signup card", () => {
    renderAt(<Signup />, "/signup");
    expect(screen.getByText("Start your history.")).toBeTruthy();
    expect(screen.getByLabelText("Username")).toBeTruthy();
  });
});

describe("dashboard", () => {
  beforeEach(() => {
    api.get.mockImplementation((url) => {
      if (url.startsWith("/userProfile/")) return Promise.resolve({ data: user });
      if (url === "/repo/user/test-user") {
        return Promise.resolve({ data: { repositories: [repo] } });
      }
      if (url === "/repo/all") {
        return Promise.resolve({ data: [repo, communityRepo] });
      }
      return Promise.resolve({ data: {} });
    });
  });

  it("renders the user's repos and the explore column", async () => {
    renderAt(<Dashboard />);

    expect(await screen.findByText("my-project")).toBeTruthy();
    expect(await screen.findByText("community-project")).toBeTruthy();
    expect(screen.getByText("Explore")).toBeTruthy();
    expect(screen.getByText("Quick start")).toBeTruthy();
  });

  it("creates a repository from the modal", async () => {
    api.post.mockResolvedValue({ data: { repositoryID: "new-repo" } });
    renderAt(<Dashboard />);

    await screen.findByText("my-project");
    fireEvent.click(screen.getByRole("button", { name: /new repository/i }));

    expect(screen.getByRole("dialog")).toBeTruthy();
    fireEvent.change(screen.getByLabelText("Name"), {
      target: { value: "brand-new" },
    });
    fireEvent.click(screen.getByRole("button", { name: /^create repository$/i }));

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith(
        "/repo/create",
        expect.objectContaining({ name: "brand-new", owner: "test-user" })
      );
    });
  });
});

describe("repo detail", () => {
  beforeEach(() => {
    api.get.mockImplementation((url) => {
      if (url.startsWith("/userProfile/")) return Promise.resolve({ data: user });
      if (url === `/repo/${repo._id}`) return Promise.resolve({ data: [repo] });
      if (url === `/repo/${repo._id}/commits`) {
        return Promise.resolve({ data: { commits: [commit] } });
      }
      if (url.startsWith("/issue/all")) return Promise.resolve({ data: [] });
      return Promise.resolve({ data: {} });
    });
  });

  it("shows the overview and switches to the issues tab", async () => {
    renderAt(
      <Routes>
        <Route path="/repo/:id" element={<RepoDetail />} />
      </Routes>,
      `/repo/${repo._id}`
    );

    expect(await screen.findByRole("heading", { name: "my-project" })).toBeTruthy();
    expect(screen.getByText("README.md")).toBeTruthy();

    fireEvent.click(screen.getByRole("tab", { name: /issues/i }));

    expect(await screen.findByText("No issues yet")).toBeTruthy();
  });

  it("renders the S3 commit history and revert command", async () => {
    renderAt(
      <Routes>
        <Route path="/repo/:id" element={<RepoDetail />} />
      </Routes>,
      `/repo/${repo._id}`
    );

    await screen.findByRole("heading", { name: "my-project" });
    fireEvent.click(screen.getByRole("tab", { name: /history/i }));

    expect(await screen.findByText("first commit")).toBeTruthy();
    expect(screen.getByText("24ec974b")).toBeTruthy();
    expect(screen.getByRole("button", { name: /copy revert/i })).toBeTruthy();
  });
});

describe("profile", () => {
  it("shows real counts and the user's repositories", async () => {
    api.get.mockImplementation((url) => {
      if (url.startsWith("/userProfile/")) return Promise.resolve({ data: user });
      if (url === "/repo/user/test-user") {
        return Promise.resolve({ data: { repositories: [repo] } });
      }
      return Promise.resolve({ data: {} });
    });

    renderAt(<Profile />, "/profile");

    expect(await screen.findByRole("heading", { name: "tester" })).toBeTruthy();
    expect(screen.getByText("Starred").parentElement.querySelector("dd").textContent).toBe("1");
    expect(screen.getByText("Following").parentElement.querySelector("dd").textContent).toBe("2");
    expect(await screen.findByText("my-project")).toBeTruthy();
  });
});
