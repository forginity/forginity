import { ReactFlow, Background, Controls } from "@xyflow/react"
import "@xyflow/react/dist/style.css"

export default function Page() {
  const initialNodes = [
    {
      id: "n1",
      position: { x: 0, y: 0 },
      data: { label: "Node 1" },
      type: "input",
    },
    {
      id: "n2",
      position: { x: 100, y: 100 },
      data: { label: "Node 2" },
      type: "output",
    },
  ]

  return (
    <div>
      <ReactFlow nodes={initialNodes} style={{ height: "100%", width: "100%" }}>
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  )
}
