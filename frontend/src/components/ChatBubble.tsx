import { motion } from "framer-motion";

interface Props {
  id: string;
  imageUrl: string;
  text: string;
}

export default function ChatBubble({ id, imageUrl, text }: Props) {
  return (
    <motion.div
      key={id}
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-slate-800/60 rounded-lg p-4 backdrop-blur"
    >
      <img
        src={imageUrl}
        alt={id}
        className="w-20 h-32 object-cover float-left mr-3 rounded-md"
      />
      <p className="text-sm whitespace-pre-line">{text}</p>
    </motion.div>
  );
}
