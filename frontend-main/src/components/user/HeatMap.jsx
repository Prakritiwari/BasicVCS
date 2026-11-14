import { useMemo } from "react";
import HeatMap from "@uiw/react-heat-map";

function hashString(value) {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function buildActivity(days = 364) {
  const end = new Date();
  end.setHours(0, 0, 0, 0);

  const start = new Date(end);
  start.setDate(start.getDate() - (days - 1));

  const data = [];

  for (let cursor = new Date(start); cursor <= end; cursor.setDate(cursor.getDate() + 1)) {
    const date = cursor.toISOString().slice(0, 10);
    const seed = hashString(date);
    const weekday = cursor.getDay();

    let count = seed % 100 < 34 ? 0 : Math.floor((seed % 100) / 5);
    if (weekday === 0 || weekday === 6) {
      count = Math.floor(count * 0.35);
    }

    data.push({ date, count });
  }

  return { data, start };
}

function grayscalePalette(maxCount) {
  const palette = { 0: "#ecefe9" };
  const from = [204, 215, 201];
  const to = [17, 17, 17];

  for (let i = 1; i <= maxCount; i += 1) {
    const ratio = i / maxCount;
    const channel = from.map((value, index) =>
      Math.round(value + (to[index] - value) * ratio)
    );
    palette[i] = `rgb(${channel[0]}, ${channel[1]}, ${channel[2]})`;
  }

  return palette;
}

export default function HeatMapProfile() {
  const { data, start } = useMemo(() => buildActivity(), []);
  const maxCount = useMemo(() => Math.max(...data.map((day) => day.count), 1), [data]);
  const palette = useMemo(() => grayscalePalette(maxCount), [maxCount]);

  return (
    <div className="heatmap-block">
      <div className="heatmap-scroll">
        <HeatMap
          className="heatmap-chart"
          value={data}
          width={820}
          height={150}
          startDate={start}
          endDate={new Date()}
          legendCellSize={0}
          rectSize={12}
          space={3}
          rectProps={{ rx: 2.5 }}
          weekLabels={["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]}
          panelColors={palette}
          style={{ color: "var(--faint)", fontFamily: "var(--font-mono)" }}
        />
      </div>

      <div className="heatmap-legend mono">
        <span>Less</span>
        {[0, 0.25, 0.5, 0.75, 1].map((ratio) => (
          <i
            key={ratio}
            style={{
              background: palette[Math.max(0, Math.round(maxCount * ratio))],
            }}
          />
        ))}
        <span>More</span>
      </div>
    </div>
  );
}
