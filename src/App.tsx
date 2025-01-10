import { useEffect, useCallback, useState, useRef } from "react";
import * as d3 from "d3";
import { Shell } from "lucide-react";
import confetti from "canvas-confetti";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import spinningAudio from "@/assets/spin-sound.mp3";
import winnerAudio from "@/assets/win-sound.mp3";

interface Participant {
  id: number;
  name: string;
  selectedAt?: Date;
}

const PADDING = { top: 20, right: 20, bottom: 20, left: 20 };
const WHEEL_SIZE = 576;
const WIDTH = WHEEL_SIZE - PADDING.left - PADDING.right;
const HEIGHT = WHEEL_SIZE - PADDING.top - PADDING.bottom;
const RADIUS = Math.min(WIDTH, HEIGHT) / 2;
const MINDURATION = 8000;
const MAXDURATION = 12000;
const COLORS = ["#e5dff6", "#e5f6df", "#dfe5f6", "#ebd4f3", "#f6f0df"];

const WheelComponent = () => {
  const [showExcludeInput, setShowExcludeInput] = useState(false);
  const [excludedName, setExcludedName] = useState("");
  const [participantInput, setParticipantInput] = useState("");
  const [availableParticipants, setAvailableParticipants] = useState<
    Participant[]
  >([]);
  const [selectedParticipants, setSelectedParticipants] = useState<
    Participant[]
  >([]);
  const [showHistory, setShowHistory] = useState(true);
  const [result, setResult] = useState("");
  const [showWinnerModal, setShowWinnerModal] = useState(false);
  const [showGrandPrizeModal, setShowGrandPrizeModal] = useState(false);
  const [currentWinner, setCurrentWinner] = useState<Participant | null>(null);

  // Sound references
  const spinningSound = useRef<HTMLAudioElement | null>(null);
  const winSound = useRef<HTMLAudioElement | null>(null);

  // Initialize audio elements
  useEffect(() => {
    spinningSound.current = new Audio(spinningAudio);
    spinningSound.current.loop = true;

    winSound.current = new Audio(winnerAudio);

    return () => {
      if (spinningSound.current) {
        spinningSound.current.pause();
        spinningSound.current = null;
      }
      if (winSound.current) {
        winSound.current.pause();
        winSound.current = null;
      }
    };
  }, []);

  const getRandomInt = useCallback((min: number, max: number): number => {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
  }, []);

  const triggerConfetti = () => {
    const duration = 3000;
    const defaults = {
      startVelocity: 30,
      spread: 360,
      ticks: 60,
      zIndex: 9999,
    };

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min;
    }

    // Play win sound
    if (winSound.current) {
      winSound.current.currentTime = 0;
      winSound.current.play();
    }

    // Initial burst
    confetti({
      ...defaults,
      particleCount: 100,
      origin: { x: 0.5, y: 0.5 },
    });

    const interval = setInterval(() => {
      const timeLeft = duration - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50;

      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
      });
    }, 250);
  };

  const handleParticipantInput = () => {
    const names = participantInput.split("\n").filter((name) => name.trim());
    const newParticipants = names.map((name, index) => ({
      id: Date.now() + index,
      name: name.trim(),
    }));
    setAvailableParticipants(newParticipants);
    setSelectedParticipants([]);
    setResult("");
  };

  const renderWheel = useCallback(() => {
    d3.select("#chart").select("svg").remove();

    const svg = d3
      .select("#chart")
      .append("svg")
      .attr("width", WHEEL_SIZE)
      .attr("height", WHEEL_SIZE);

    const container = svg
      .append("g")
      .attr("class", "chartcontainer")
      .attr(
        "transform",
        `translate(${WIDTH / 2 + PADDING.left},${HEIGHT / 2 + PADDING.top})`,
      );

    const wheel = container.append("g").attr("class", "wheel");

    const pie = d3
      .pie<Participant>()
      .sort(null)
      .value(() => 1);
    const arc = d3
      .arc<d3.PieArcDatum<Participant>>()
      .innerRadius(0)
      .outerRadius(RADIUS);
    const color = d3.scaleOrdinal(COLORS);

    const arcs = wheel
      .selectAll("g.slice")
      .data(pie(availableParticipants))
      .enter()
      .append("g")
      .attr("class", "slice");

    arcs
      .append("path")
      .attr("fill", (_, i) => color(i.toString()))
      .attr("d", arc);

    arcs
      .append("text")
      .attr("transform", (d) => {
        const angle = (d.startAngle + d.endAngle) / 2;
        return `rotate(${(angle * 180) / Math.PI - 90})translate(${RADIUS - 10})`;
      })
      .attr("text-anchor", "end")
      .text((d) => d.data.name)
      .style("font-size", "18px");

    svg
      .append("g")
      .attr("class", "arrow")
      .attr(
        "transform",
        `translate(${(WIDTH + PADDING.left + PADDING.right) / 2 - 15}, 12)`,
      )
      .append("path")
      .attr("d", `M0 0 H30 L 15 ${(Math.sqrt(3) / 2) * 30}Z`)
      .style("fill", "#000809");

    const spin = () => {
      if (availableParticipants.length <= 1) {
        alert("Cần ít nhất 2 người để quay");
        return;
      }

      // Start spinning sound
      if (spinningSound.current) {
        spinningSound.current.currentTime = 0;
        spinningSound.current.play();
      }

      let randomAssetIndex: number;
      do {
        randomAssetIndex = getRandomInt(0, availableParticipants.length);
      } while (
        excludedName &&
        availableParticipants[randomAssetIndex].name === excludedName
      );

      const piedegree = 360 / availableParticipants.length;
      const randomPieMovement = getRandomInt(1, piedegree);
      const randomDegrees = getRandomInt(8, 12) * 360;
      const rotation =
        (availableParticipants.length - randomAssetIndex) * piedegree -
        randomPieMovement +
        randomDegrees;

      wheel
        .transition()
        .duration(getRandomInt(MINDURATION, MAXDURATION))
        .attrTween("transform", () => {
          const interpolate = d3.interpolate(0, rotation);
          return (t: number) => `rotate(${interpolate(t)})`;
        })
        .ease(d3.easeCircleOut)
        .on("end", () => {
          // Stop spinning sound
          if (spinningSound.current) {
            spinningSound.current.pause();
            spinningSound.current.currentTime = 0;
          }

          const selectedParticipant = {
            ...availableParticipants[randomAssetIndex],
            selectedAt: new Date(),
          };
          setResult(selectedParticipant.name);
          setCurrentWinner(selectedParticipant);

          setShowWinnerModal(true);
          triggerConfetti();

          setSelectedParticipants((prev) => [...prev, selectedParticipant]);
          setAvailableParticipants((prev) =>
            prev.filter((p) => p.id !== selectedParticipant.id),
          );
        });
    };

    const pushButton = d3.select("#push");
    pushButton.on("click", spin);
  }, [getRandomInt, excludedName, availableParticipants]);

  useEffect(() => {
    if (availableParticipants.length > 0) {
      renderWheel();
    }
  }, [renderWheel, availableParticipants]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const handleGrandPrize = () => {
    if (winSound.current) {
      winSound.current.currentTime = 0;
      winSound.current.play();
    }
    triggerConfetti();
  };

  return (
    <div className="flex h-screen w-screen font-bangers">
      {/* Left side - Wheel and Exclude Input */}
      <div className="relative flex w-1/2 flex-col items-center justify-center border-r border-gray-200">
        <div
          className="absolute left-4 top-4 z-20"
          onMouseEnter={() => setShowExcludeInput(true)}
          onMouseLeave={() => setShowExcludeInput(false)}
        >
          <div
            className={`transition-all duration-300 ${
              showExcludeInput ? "opacity-100" : "opacity-0"
            }`}
          >
            <Input
              type="text"
              placeholder="Nhập tên người cần tránh"
              value={excludedName}
              onChange={(e) => setExcludedName(e.target.value)}
              className="w-64"
            />
          </div>
        </div>

        <div className="relative">
          <button
            id="push"
            className="group absolute left-1/2 top-1/2 z-10 h-[120px] w-[120px] -translate-x-1/2 -translate-y-1/2 transform"
          >
            <div className="absolute left-0 top-0 h-[100px] w-[100px] transform rounded-full border border-black bg-white transition-transform duration-200 ease-linear group-hover:translate-x-1 group-hover:translate-y-1 group-active:hidden">
              <Shell className="absolute left-[calc(50%-20px)] top-[calc(50%-20px)] h-[40px] w-[40px] text-[#380f0f]" />
            </div>
            <div className="absolute left-2 top-2 z-[-1] h-[100px] w-[100px] rounded-full border border-black bg-[#ebd4f3] shadow-[10px_10px_0px_0px_rgba(186,172,191,0.35)] transition-shadow duration-200 ease-linear group-hover:shadow-[5px_5px_0px_0px_rgba(186,172,191,0.35)] group-active:bg-white group-active:shadow-[inset_5px_5px_0px_0px_transparent]">
              <Shell className="absolute left-[calc(50%-20px)] top-[calc(50%-20px)] h-[40px] w-[40px] text-[#380f0f]" />
            </div>
          </button>
          <div id="chart" className="relative inline-block h-[576px] w-[576px]">
            <div className="absolute left-0 top-0 z-[-1] h-[576px] w-[576px] rounded-full border border-black bg-white"></div>
            <div className="absolute left-2 top-2 z-[-2] h-[576px] w-[576px] translate-x-[10px] translate-y-[10px] transform rounded-full border border-black bg-[#ebd4f3] shadow-[10px_10px_0px_0px_rgba(186,172,191,0.35)]"></div>
          </div>
        </div>
      </div>

      {/* Right side - Controls and Information */}
      <div className="flex w-1/2 flex-col gap-6 p-8 tracking-widest">
        <div className="flex flex-col gap-4">
          <h2 className="text-2xl">Danh sách người tham gia</h2>
          <Textarea
            placeholder="Nhập tên người tham gia (mỗi người một dòng)"
            value={participantInput}
            onChange={(e) => setParticipantInput(e.target.value)}
            className="h-48"
          />
          <div className="flex gap-4">
            <button
              onClick={handleParticipantInput}
              className="w-full rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
            >
              Cập nhật danh sách
            </button>
          </div>
        </div>

        <div className="mt-4 rounded-lg border border-gray-200 p-4">
          <div className="mb-4 text-2xl">KẾT QUẢ: {result}</div>
          <div className="text-sm">
            Số người còn lại: {availableParticipants.length}
          </div>
        </div>

        <div className="max-h-48 overflow-y-auto rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Lịch sử quay</h3>
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              {showHistory ? "Ẩn" : "Hiện"}
            </button>
          </div>
          {showHistory && selectedParticipants.length > 0 && (
            <div className="mt-2 space-y-2">
              {selectedParticipants.map((participant, index) => (
                <div
                  key={participant.id}
                  className="flex items-center justify-between gap-4"
                >
                  <span className="font-medium">
                    {index + 1}. {participant.name}
                  </span>
                  {participant.selectedAt && (
                    <span className="text-sm text-gray-500">
                      {formatTime(participant.selectedAt)}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Winner Modal */}
      <Dialog
        open={showWinnerModal}
        onOpenChange={(open) => {
          setShowWinnerModal(open);
          if (!open && availableParticipants.length === 1) {
            setTimeout(() => {
              setShowGrandPrizeModal(true);
              handleGrandPrize(); // Play sound and trigger confetti for grand prize
            }, 500);
          }
        }}
      >
        <DialogContent className="font-bangers tracking-widest sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="text-center text-4xl tracking-widest text-yellow-500">
              🎉 Chúc mừng! 🎉
            </DialogTitle>
            <DialogDescription className="pt-6 text-center">
              <div className="relative">
                <div className="rounded-lg bg-gradient-to-r from-pink-200 via-purple-200 to-blue-200 p-8 uppercase">
                  <div className="text-3xl font-bold uppercase text-purple-800">
                    {currentWinner?.name}
                  </div>
                  <div className="mt-4 text-xl font-medium text-purple-600">
                    đã được chọn!
                  </div>
                </div>
              </div>
              <div className="mt-6 flex justify-center gap-4">
                <span className="animate-bounce text-2xl">🎈</span>
                <span className="animate-bounce text-2xl delay-100">🎁</span>
                <span className="animate-bounce text-2xl delay-200">🎊</span>
              </div>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>

      {/* Grand Prize Modal */}
      <Dialog open={showGrandPrizeModal} onOpenChange={setShowGrandPrizeModal}>
        <DialogContent className="font-bangers tracking-widest sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="text-center">
              <div className="text-4xl tracking-widest text-yellow-500">
                🌟 GIẢI ĐẶC BIỆT 🌟
              </div>
            </DialogTitle>
            <DialogDescription className="pt-6 text-center">
              <div className="relative">
                <div className="rounded-lg bg-gradient-to-r from-yellow-200 via-yellow-100 to-yellow-200 p-8 uppercase">
                  <div className="text-xl font-medium text-yellow-600">
                    xin chúc mừng
                  </div>
                  <div className="mt-4 text-3xl font-bold uppercase text-red-500">
                    {availableParticipants[0]?.name}
                  </div>
                  <div className="mt-4 text-xl font-medium text-yellow-600">
                    may mắn trúng giải đặc biệt
                  </div>
                </div>
              </div>
              <div className="mt-6 flex justify-center gap-4">
                <span className="animate-bounce text-2xl">🏆</span>
                <span className="animate-bounce text-2xl delay-100">👑</span>
                <span className="animate-bounce text-2xl delay-200">💝</span>
              </div>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WheelComponent;
