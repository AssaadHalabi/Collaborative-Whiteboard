// src/components/DrawingCanvas.js
import React, { useRef, useState, useEffect } from 'react';
import { Stage, Layer, Line } from 'react-konva';
import Konva from 'konva';
import { v4 as uuidv4 } from 'uuid';
import { useSearchParams } from 'react-router-dom';
import io from 'socket.io-client';

const getRandomColor = () => {
  const colors = ["red", "black", "green", "blue"];
  return colors[Math.floor(Math.random() * colors.length)];
};

const DrawingCanvas = () => {
  const [lines, setLines] = useState([]);
  const [selectedLineId, setSelectedLineId] = useState(null);
  const [user, setUser] = useState({ id: uuidv4(), name: '', color: getRandomColor() });
  const isDrawing = useRef(false);
  const dragStartPos = useRef(null);
  const highlightTween = useRef(null);
  const [searchParams] = useSearchParams();
  const socket = useRef(null);

  useEffect(() => {
    const name = searchParams.get('name');
    setUser((prevUser) => ({ ...prevUser, name }));

    // Initialize socket connection
    socket.current = io('http://localhost:4000');

    socket.current.on('drawing', (data) => {
      setLines(data.lines);
    });

    return () => {
      socket.current.disconnect(); // Clean up the socket connection when the component unmounts
    };
  }, [searchParams]);

  const handleMouseDown = (event) => {
    const stage = event.target.getStage();
    const point = stage.getPointerPosition();
    const clickedOnLine = stage.findOne((node) => {
      if (node.className === 'Line') {
        const { x, y, width, height } = node.getClientRect();
        return Konva.Util.haveIntersection({ x: point.x, y: point.y, width: 1, height: 1 }, { x, y, width, height });
      }
      return false;
    });

    if (clickedOnLine) {
      setSelectedLineId(clickedOnLine.attrs.id);
      dragStartPos.current = point; // Store the initial drag position
      highlightLine(clickedOnLine);
      isDrawing.current = false; // Stop drawing if we select a line
    } else {
      setSelectedLineId(null);
      if (highlightTween.current) {
        highlightTween.current.destroy();
        highlightTween.current = null;
      }
      isDrawing.current = true;
      const newLine = { id: uuidv4(), points: [], userId: user.id, userName: user.name, color: user.color };
      setLines([...lines, newLine]);
      dragStartPos.current = null; // Reset drag start position when starting a new line
    }
  };

  const handleMouseMove = (event) => {
    if (!isDrawing.current) return;

    const stage = event.target.getStage();
    const point = stage.getPointerPosition();
    const lastLine = lines[lines.length - 1];
    lastLine.points = lastLine.points.concat([point.x, point.y]);

    setLines(lines.concat());
  };

  const handleMouseUp = () => {
    isDrawing.current = false;
    dragStartPos.current = null; // Reset drag start position on mouse up
    // Send the drawing data to the server with user info
    socket.current.emit('drawing', { lines, user });
  };

  const handleDragMove = (e, lineId) => {
    const stage = e.target.getStage();
    const point = stage.getPointerPosition();

    if (!dragStartPos.current) {
      dragStartPos.current = point; // Initialize drag start position if not set
    }

    const dx = point.x - dragStartPos.current.x;
    const dy = point.y - dragStartPos.current.y;
    dragStartPos.current = point;

    const line = lines.find((l) => l.id === lineId);
    const newPoints = line.points.map((coord, index) => (index % 2 === 0 ? coord + dx : coord + dy));

    const updatedLines = lines.map((l) => (l.id === lineId ? { ...l, points: newPoints } : l));
    setLines(updatedLines);
  };

  const highlightLine = (line) => {
    if (highlightTween.current) {
      highlightTween.current.destroy();
    }

    highlightTween.current = new Konva.Tween({
      node: line,
      strokeWidth: 7,
      duration: 0.3,
      yoyo: true,
      easing: Konva.Easings.EaseInOut,
    });

    highlightTween.current.play();
  };

  return (
    <Stage
      width={window.innerWidth}
      height={window.innerHeight}
      onMouseDown={handleMouseDown}
      onMousemove={handleMouseMove}
      onMouseup={handleMouseUp}
    >
      <Layer>
        {lines.map((line) => (
          <Line
            key={line.id}
            id={line.id}
            points={line.points}
            stroke={line.color}
            strokeWidth={5}
            tension={0.5}
            lineCap="round"
            lineJoin="round"
            draggable={selectedLineId === line.id}
            onDragMove={(e) => handleDragMove(e, line.id)}
          />
        ))}
      </Layer>
    </Stage>
  );
};

export default DrawingCanvas;
