import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { useGLTF, Stage, OrbitControls, Html } from "@react-three/drei";
import { FaSpinner } from "react-icons/fa";

const Model = ({ url, onPartClick }) => {
  const { scene } = useGLTF(url);

  return (
    <primitive
      object={scene}
      onClick={(e) => {
        e.stopPropagation(); // Ngăn click xuyên thấu

        let clickedObj = e.object;

        // BÍ QUYẾT Ở ĐÂY: Vòng lặp leo ngược lên Khối Cha (Parent)
        // Dừng lại khi đụng tới gốc của cả cảnh (thường tên là "Scene" hoặc "RootNode")
        let parentGroup = clickedObj;
        while (
          parentGroup.parent &&
          parentGroup.parent.type === "Group" && // Hoặc Object3D
          parentGroup.parent.name !== "Scene" &&
          parentGroup.parent.name !== "RootNode"
        ) {
          parentGroup = parentGroup.parent;
        }

        // Ưu tiên lấy tên Khối Cha (tên bạn đã đặt lúc ấn Ctrl+J),
        // Nếu không có thì mới lấy tên của cái mảnh vỡ.
        const finalPartName = parentGroup.name || clickedObj.name;

        console.log("👉 Đã phát hiện click vào cụm:", finalPartName);
        console.log("   (Mảnh vỡ thực tế chạm vào:", clickedObj.name, ")");

        if (onPartClick) {
          onPartClick(finalPartName);
        }
      }}
      onPointerOver={() => (document.body.style.cursor = "pointer")}
      onPointerOut={() => (document.body.style.cursor = "auto")}
    />
  );
};

const Loader = () => (
  <Html center>
    <div className="flex flex-col items-center justify-center text-blue-400">
      <FaSpinner className="animate-spin text-3xl mb-2" />
      <span className="text-sm font-medium tracking-widest">
        LOADING ASSET...
      </span>
    </div>
  </Html>
);

export default function Local3DViewer({
  modelPath = "/OilandGasStation.glb",
  onPartSelect,
}) {
  return (
    <div className="viewer-container">
      <div className="viewer-badge">
        <span>SECURE 3D VIEWER</span>
      </div>

      <Canvas shadows camera={{ position: [0, 2, 5], fov: 50 }}>
        <Suspense fallback={<Loader />}>
          <Stage environment="warehouse" intensity={0.5}>
            <Model url={modelPath} onPartClick={onPartSelect} />
          </Stage>
        </Suspense>
        <OrbitControls
          makeDefault
          autoRotate
          autoRotateSpeed={0.5}
          minDistance={1}
          maxDistance={20}
        />
      </Canvas>

      <div className="viewer-hint">
        Left Click: Rotate &nbsp;|&nbsp; Scroll: Zoom &nbsp;|&nbsp; Right Click:
        Pan
      </div>
    </div>
  );
}

useGLTF.preload("/models/OilandGasStation.glb");
