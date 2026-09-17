import { useMemo } from "react";
import { motion } from "framer-motion";

/**
 * Envuelve cualquier icono de lucide-react y lo anima al pasar el mouse.
 *
 * Uso:
 *   import AnimatedIcon from "./AnimatedIcon";
 *   import { BadgeDollarSign } from "lucide-react";
 *   <AnimatedIcon icon={BadgeDollarSign} anim="wiggle" size={16} />
 *
 * `anim` = wiggle | spin | bounce | pop | pulse   (por defecto "pop")
 */
const VARIANTS = {
  wiggle: { rotate: [0, -12, 12, -8, 0], transition: { duration: 0.55 } },
  spin:   { rotate: 360,                 transition: { duration: 0.7, ease: "easeInOut" } },
  bounce: { y: [0, -4, 0],               transition: { duration: 0.5 } },
  pop:    { scale: 1.25,                 transition: { type: "spring", stiffness: 400, damping: 12 } },
  pulse:  { scale: [1, 1.15, 1],         transition: { duration: 0.7, repeat: Infinity } },
};

export default function AnimatedIcon({
  icon: Icon,
  anim = "pop",
  size = 16,
  strokeWidth = 1.75,
  ...rest
}) {
  // motion.create es la API de framer-motion v11/12 para envolver un componente.
  const MotionIcon = useMemo(() => motion.create(Icon), [Icon]);
  return (
    <MotionIcon
      size={size}
      strokeWidth={strokeWidth}
      whileHover={VARIANTS[anim] || VARIANTS.pop}
      {...rest}
    />
  );
}
