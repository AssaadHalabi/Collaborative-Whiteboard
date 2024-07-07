import Cursor from "./Cursor";
import { COLORS } from "@/constants";
import { LiveCursorProps } from "@/types/type";

// display all other live cursors
const LiveCursors = ({ others }: LiveCursorProps) => {
  return others.map(({ connectionId, presence }) => {
    if (presence == null || !presence?.cursor) {
      return null;
    }
    console.log(`Other connectionId: ${connectionId}`);
    console.log(`presence info: ${JSON.stringify(presence, null, 2)}`);
    
    return (
      <Cursor
        key={connectionId}
        color={COLORS[Number(connectionId) % COLORS.length]}
        x={presence.cursor.x}
        y={presence.cursor.y}
        message={presence.message}
      />
    );
  });
};

export default LiveCursors;
