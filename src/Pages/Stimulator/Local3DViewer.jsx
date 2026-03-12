import { Suspense, useState, useEffect, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF, Stage, OrbitControls, Html } from "@react-three/drei";
import { FaSpinner } from "react-icons/fa";
import * as THREE from "three";

// --- CẤU HÌNH MÀU SẮC ---
const HOVER_GLOW_COLOR = new THREE.Color(0x00aaff); // Xanh dương khi Hover
const SELECT_GLOW_COLOR = new THREE.Color(0x00ff00); // Đỏ khi Click
const BASE_GLOW_INTENSITY = 0.6;

// --- BẢN FIX: GOM CÁC MẢNH VỠ GLTF VỀ CÙNG MỘT TÊN ---
const getPartName = (object) => {
  let current = object;
  let bestName = object.name;

  const skipKeywords = [
    "scene",
    "rootnode",
    "root",
    "sketchfab",
    "group",
    "node",
    "gltf",
  ];

  // 1. Leo ngược lên cây gia phả để tìm tên Group cha cao nhất
  while (current) {
    const lowerName = (current.name || "").toLowerCase();

    // Kiểm tra xem tên có phải là rác không
    const isGeneric =
      skipKeywords.some((kw) => lowerName.includes(kw)) ||
      lowerName.match(/^mesh(_\d+)?$/) ||
      lowerName.match(/^object(_\d+)?$/);

    // Càng leo lên cao, ghi đè lấy tên cha mang tính "tổng quát" nhất
    if (current.name && !isGeneric) {
      bestName = current.name;
    }

    if (!current.parent || current.parent.name === "Scene") break;
    current = current.parent;
  }

  // 2. BÍ QUYẾT FIX LỖI: Cắt bỏ các đuôi do glTF tự chẻ ra khi có nhiều màu
  // Ví dụ: "MainValve_primitive0" -> "MainValve"
  //        "PumpStation_1" -> "PumpStation"
  let finalName = bestName.replace(/_primitive\d+$/, "");
  finalName = finalName.replace(/_\d+$/, "");

  return finalName;
};

const Model = ({ url, onPartClick, selectedPart }) => {
  const { scene } = useGLTF(url);
  const [hoveredPart, setHoveredPart] = useState(null);

  const originalMaterials = useRef(new Map());
  const meshToPartMap = useRef(new Map());

  // 1. Lưu giữ vật liệu gốc khi load xong
  useEffect(() => {
    scene.traverse((child) => {
      if (child.isMesh) {
        const partName = getPartName(child);
        meshToPartMap.current.set(child.uuid, partName);

        if (child.material) {
          // BÍ QUYẾT FIX LỖI: Nhân bản (Clone) Material để chúng không xài chung nữa
          if (Array.isArray(child.material)) {
            child.material = child.material.map((m) => m.clone());
          } else {
            child.material = child.material.clone();
          }

          // Lưu màu gốc (Xử lý an toàn cho cả trường hợp 1 màu và nhiều màu)
          const mats = Array.isArray(child.material)
            ? child.material
            : [child.material];

          originalMaterials.current.set(
            child.uuid,
            mats.map((mat) => ({
              emissive: mat.emissive
                ? mat.emissive.clone()
                : new THREE.Color(0x000000),
              emissiveIntensity: mat.emissiveIntensity || 0,
            })),
          );
        }
      }
    });
  }, [scene]);

  // 2. Cập nhật màu sắc (Xanh dương cho hover, Đỏ cho select)
  useEffect(() => {
    scene.traverse((child) => {
      if (child.isMesh && child.material) {
        const partName = meshToPartMap.current.get(child.uuid);
        const originalMats = originalMaterials.current.get(child.uuid);

        if (!originalMats) return;

        const mats = Array.isArray(child.material)
          ? child.material
          : [child.material];

        // Duyệt qua từng lớp màu của vật thể
        mats.forEach((mat, index) => {
          const original = originalMats[index];
          if (!original) return;

          if (selectedPart && partName === selectedPart) {
            mat.emissive = SELECT_GLOW_COLOR.clone();
            // Không set Intensity ở đây vì useFrame sẽ làm nó nhấp nháy
          } else if (hoveredPart && partName === hoveredPart) {
            mat.emissive = HOVER_GLOW_COLOR.clone();
            mat.emissiveIntensity = BASE_GLOW_INTENSITY;
          } else {
            // Trả về màu zin ban đầu
            mat.emissive = original.emissive.clone();
            mat.emissiveIntensity = original.emissiveIntensity;
          }
        });
      }
    });
  }, [hoveredPart, selectedPart, scene]);

  // 3. HIỆU ỨNG NHẤP NHÁY
  useFrame((state) => {
    if (selectedPart) {
      // Công thức tạo nhịp đập mượt mà
      const pulseIntensity =
        0.4 + Math.abs(Math.sin(state.clock.elapsedTime * 5)) * 0.8;

      scene.traverse((child) => {
        if (child.isMesh && child.material) {
          const partName = meshToPartMap.current.get(child.uuid);

          if (partName === selectedPart) {
            const mats = Array.isArray(child.material)
              ? child.material
              : [child.material];
            mats.forEach((mat) => {
              mat.emissiveIntensity = pulseIntensity; // Ép cường độ sáng lên xuống
            });
          }
        }
      });
    }
  });

  const handlePointerOver = (e) => {
    e.stopPropagation();
    document.body.style.cursor = "pointer";
    const partName =
      meshToPartMap.current.get(e.object.uuid) || getPartName(e.object);
    setHoveredPart(partName);
  };

  const handlePointerOut = (e) => {
    e.stopPropagation();
    document.body.style.cursor = "auto";
    setHoveredPart(null);
  };

  const handleClick = (e) => {
    e.stopPropagation();
    const partName =
      meshToPartMap.current.get(e.object.uuid) || getPartName(e.object);
    if (onPartClick) onPartClick(partName);
  };

  // Click ra ngoài khoảng không để hủy chọn
  const handlePointerMissed = () => {
    if (onPartClick) onPartClick(null);
  };

  return (
    <primitive
      object={scene}
      onClick={handleClick}
      onPointerMissed={handlePointerMissed}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
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
  modelPath = "/models/OilandGasStation.glb",
  onPartSelect,
  selectedPart,
}) {
  return (
    <div
      className="viewer-container"
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        minHeight: "500px",
        borderRadius: "8px",
        overflow: "hidden",
        backgroundColor: "#0d1117",
      }}
    >
      <div
        className="viewer-badge"
        style={{
          position: "absolute",
          top: "16px",
          left: "16px",
          zIndex: 10,
          background: "rgba(0,0,0,0.5)",
          padding: "4px 8px",
          borderRadius: "4px",
          color: "#9ca3af",
          fontSize: "12px",
          border: "1px solid #374151",
        }}
      >
        <span>SECURE 3D VIEWER</span>
      </div>

      <Canvas shadows camera={{ position: [0, 2, 5], fov: 50 }}>
        <Suspense fallback={<Loader />}>
          <Stage environment="warehouse" intensity={0.5}>
            <Model
              url={modelPath}
              onPartClick={onPartSelect}
              selectedPart={selectedPart}
            />
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
    </div>
  );
}

useGLTF.preload("/models/OilandGasStation.glb");
