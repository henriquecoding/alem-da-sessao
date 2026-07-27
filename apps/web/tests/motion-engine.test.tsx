import { act, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  useChoreography,
  type Timeline,
} from "@/components/motion/use-choreography";

function Player({
  score,
  loop = false,
  enabled = true,
}: {
  score: (timeline: Timeline) => void;
  loop?: boolean;
  enabled?: boolean;
}) {
  useChoreography(score, { loop, enabled });
  return null;
}

describe("choreography engine", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("plays each cue at an offset from the previous one, not from the start", () => {
    const played: string[] = [];
    const score = (timeline: Timeline) => {
      played.push("top");
      timeline.beat(100, () => played.push("a"));
      timeline.beat(150, () => played.push("b"));
    };

    render(<Player score={score} />);
    // The score body runs synchronously, so a demo can clear the previous
    // cycle's state before anything is painted.
    expect(played).toEqual(["top"]);

    act(() => {
      vi.advanceTimersByTime(100);
    });
    expect(played).toEqual(["top", "a"]);

    act(() => {
      vi.advanceTimersByTime(149);
    });
    expect(played).toEqual(["top", "a"]);

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(played).toEqual(["top", "a", "b"]);
  });

  it("counts a hold towards the playhead without scheduling anything", () => {
    const played: string[] = [];
    const score = (timeline: Timeline) => {
      timeline.hold(500);
      timeline.beat(100, () => played.push("late"));
    };

    render(<Player score={score} />);

    act(() => {
      vi.advanceTimersByTime(599);
    });
    expect(played).toEqual([]);

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(played).toEqual(["late"]);
  });

  it("never plays a cue into an unmounted tree", () => {
    const played: string[] = [];
    const { unmount } = render(
      <Player
        score={(timeline) => timeline.beat(100, () => played.push("a"))}
      />,
    );

    unmount();
    act(() => {
      vi.advanceTimersByTime(5_000);
    });

    expect(played).toEqual([]);
  });

  it("stays silent when disabled, which is how reduced motion is honoured", () => {
    const played: string[] = [];
    render(
      <Player
        enabled={false}
        score={(timeline) => {
          played.push("top");
          timeline.beat(10, () => played.push("a"));
        }}
      />,
    );

    act(() => {
      vi.advanceTimersByTime(5_000);
    });

    expect(played).toEqual([]);
  });

  it("restarts a loop after the closing hold, not after the last cue", () => {
    const played: string[] = [];
    const score = (timeline: Timeline) => {
      played.push("top");
      timeline.beat(100, () => played.push("a"));
      timeline.hold(400);
    };

    render(<Player score={score} loop />);

    act(() => {
      vi.advanceTimersByTime(100);
    });
    expect(played).toEqual(["top", "a"]);

    // The reading pause has to elapse before the demo starts over.
    act(() => {
      vi.advanceTimersByTime(399);
    });
    expect(played).toEqual(["top", "a"]);

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(played).toEqual(["top", "a", "top"]);
  });
});
