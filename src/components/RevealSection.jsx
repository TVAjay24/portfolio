import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";

const RevealSection = ({ children, id, className, style }) => {
  const { ref, inView } = useInView({
    triggerOnce: true, // Animates only once when scrolling down
    threshold: 0.1,    // Triggers when 10% of the component is visible
  });

  return (
    <motion.div
      ref={ref}
      id={id}
      className={className}
      style={style}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
};

export default RevealSection;
