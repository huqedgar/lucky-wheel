import { useEffect, useCallback, useState, useRef } from "react";
import * as d3 from "d3";
import { Eye, KeyRound, Shell, Users } from "lucide-react";
import confetti from "canvas-confetti";
import { Participant } from "@/types/app.type";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import WinnerModal from "@/components/winner-modal";
import GrandPrizeModal from "@/components/grand-prize-modal";
import HostModal from "@/components/host-modal";
import spinningAudio from "@/assets/spin-sound.mp3";
import winnerAudio from "@/assets/win-sound.mp3";
import supabase from "@/utils/supabase";

// =============== Types ===============

interface SpinState {
  isSpinning: boolean;
  rotation: number;
  duration: number;
  targetParticipant: number;
}

interface OnlineUser {
  id: string;
  last_seen: string;
}

// =============== Constants ===============
const WHEEL_CONSTANTS = {
  PADDING: { top: 20, right: 20, bottom: 20, left: 20 },
  SIZE: window.innerWidth < 768 ? Math.min(window.innerWidth - 40, 400) : 576,
  COLORS: ["#e5dff6", "#e5f6df", "#dfe5f6", "#ebd4f3", "#f6f0df"],
  SPIN_DURATION: {
    MIN: 8000,
    MAX: 12000,
  },
};

const WHEEL_DIMENSIONS = {
  WIDTH:
    WHEEL_CONSTANTS.SIZE -
    WHEEL_CONSTANTS.PADDING.left -
    WHEEL_CONSTANTS.PADDING.right,
  HEIGHT:
    WHEEL_CONSTANTS.SIZE -
    WHEEL_CONSTANTS.PADDING.top -
    WHEEL_CONSTANTS.PADDING.bottom,
  get RADIUS() {
    return Math.min(this.WIDTH, this.HEIGHT) / 2;
  },
};

const WheelComponent = () => {
  // =============== Refs ===============
  const spinningSound = useRef<HTMLAudioElement | null>(null);
  const winSound = useRef<HTMLAudioElement | null>(null);
  const wheelRef =
    useRef<d3.Selection<SVGGElement, unknown, HTMLElement, unknown>>();
  const userId = useRef<string>(crypto.randomUUID());

  // =============== State Management ===============
  // UI Control States
  const [showHostModal, setShowHostModal] = useState(false);
  const [showExcludeInput, setShowExcludeInput] = useState(false);
  const [showHistory, setShowHistory] = useState(true);
  const [showWinnerModal, setShowWinnerModal] = useState(false);
  const [showGrandPrizeModal, setShowGrandPrizeModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // User Input States
  const [hostCode, setHostCode] = useState("");
  const [isHostMode, setIsHostMode] = useState(false);
  const [excludedName, setExcludedName] = useState(
    "BS.CKII NGUYỄN THỊ THU HIỀN",
  );
  const [participantInput, setParticipantInput] = useState("");

  // Data States
  const [availableParticipants, setAvailableParticipants] = useState<
    Participant[]
  >([]);
  const [selectedParticipants, setSelectedParticipants] = useState<
    Participant[]
  >([]);
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const [result, setResult] = useState("");
  const [currentWinner, setCurrentWinner] = useState<Participant | null>(null);

  // =============== Utility Functions ===============
  const getRandomInt = useCallback((min: number, max: number): number => {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
  }, []);

  const formatTime = useCallback((date: Date): string => {
    return new Date(date).toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  }, []);

  // =============== Animation Functions ===============
  const triggerConfetti = useCallback(() => {
    const duration = 3000;
    const defaults = {
      startVelocity: 30,
      spread: 360,
      ticks: 60,
      zIndex: 9999,
    };

    if (winSound.current) {
      winSound.current.currentTime = 0;
      winSound.current.play();
    }

    const randomInRange = (min: number, max: number) =>
      Math.random() * (max - min) + min;

    confetti({
      ...defaults,
      particleCount: 100,
      origin: { x: 0.5, y: 0.5 },
    });

    const interval = setInterval(() => {
      if (duration - Date.now() <= 0) {
        return clearInterval(interval);
      }

      confetti({
        ...defaults,
        particleCount: 50,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
      });
      confetti({
        ...defaults,
        particleCount: 50,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
      });
    }, 250);
  }, []);

  // =============== Wheel Core Functions ===============
  const handleSpinAnimation = useCallback(
    (spinState: SpinState) => {
      if (!wheelRef.current) return;

      if (spinningSound.current) {
        spinningSound.current.currentTime = 0;
        spinningSound.current.play();
      }

      wheelRef.current
        .transition()
        .duration(spinState.duration)
        .attrTween("transform", () => {
          const interpolate = d3.interpolate(0, spinState.rotation);
          return (t: number) => `rotate(${interpolate(t)})`;
        })
        .ease(d3.easeCircleOut)
        .on("end", async () => {
          if (spinningSound.current) {
            spinningSound.current.pause();
            spinningSound.current.currentTime = 0;
          }

          const selectedParticipant = {
            ...availableParticipants[spinState.targetParticipant],
            selected_at: new Date().toISOString(),
          };

          setResult(selectedParticipant.name);
          setCurrentWinner(selectedParticipant);
          setShowWinnerModal(true);
          triggerConfetti();

          if (isHostMode) {
            try {
              await Promise.all([
                supabase
                  .from("participants")
                  .delete()
                  .eq("id", selectedParticipant.id),
                supabase.from("selected_participants").insert({
                  id: selectedParticipant.id,
                  name: selectedParticipant.name,
                  selected_at: new Date().toISOString(),
                }),
              ]);
            } catch (error) {
              console.error("Error updating participants:", error);
              toast.error("Lỗi khi cập nhật người chơi");
            }
          }
        });
    },
    [availableParticipants, isHostMode, triggerConfetti],
  );

  const spin = useCallback(async () => {
    if (!isHostMode || availableParticipants.length <= 1) {
      toast.warning("Cần ít nhất 2 người để quay");
      return;
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

    const spinState: SpinState = {
      isSpinning: true,
      rotation,
      duration: getRandomInt(
        WHEEL_CONSTANTS.SPIN_DURATION.MIN,
        WHEEL_CONSTANTS.SPIN_DURATION.MAX,
      ),
      targetParticipant: randomAssetIndex,
    };

    try {
      await supabase.channel("spin-state").send({
        type: "broadcast",
        event: "spin",
        payload: { spinState },
      });
    } catch (error) {
      console.error("Error broadcasting spin:", error);
      toast.error("Lỗi khi quay");
    }
  }, [availableParticipants, excludedName, getRandomInt, isHostMode]);

  const renderWheel = useCallback(() => {
    d3.select("#chart").select("svg").remove();

    const svg = d3
      .select("#chart")
      .append("svg")
      .attr("width", WHEEL_CONSTANTS.SIZE)
      .attr("height", WHEEL_CONSTANTS.SIZE);

    const container = svg
      .append("g")
      .attr("class", "chartcontainer")
      .attr(
        "transform",
        `translate(${WHEEL_DIMENSIONS.WIDTH / 2 + WHEEL_CONSTANTS.PADDING.left},
                  ${WHEEL_DIMENSIONS.HEIGHT / 2 + WHEEL_CONSTANTS.PADDING.top})`,
      );

    const wheel = container.append("g").attr("class", "wheel");
    wheelRef.current = wheel;

    const pie = d3
      .pie<Participant>()
      .sort(null)
      .value(() => 1);
    const arc = d3
      .arc<d3.PieArcDatum<Participant>>()
      .innerRadius(0)
      .outerRadius(WHEEL_DIMENSIONS.RADIUS);
    const color = d3.scaleOrdinal(WHEEL_CONSTANTS.COLORS);

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
        return `rotate(${(angle * 180) / Math.PI - 90})translate(${WHEEL_DIMENSIONS.RADIUS - 10})`;
      })
      .attr("text-anchor", "end")
      .text((d) => d.data.name)
      .style("font-size", "18px");

    svg
      .append("g")
      .attr("class", "arrow")
      .attr(
        "transform",
        `translate(${
          (WHEEL_DIMENSIONS.WIDTH +
            WHEEL_CONSTANTS.PADDING.left +
            WHEEL_CONSTANTS.PADDING.right) /
            2 -
          15
        }, 12)`,
      )
      .append("path")
      .attr("d", `M0 0 H30 L 15 ${(Math.sqrt(3) / 2) * 30}Z`)
      .style("fill", "#000809");

    const pushButton = d3.select("#push");
    pushButton.on("click", spin);
  }, [availableParticipants, spin]);

  // =============== Data Management Functions ===============
  const handleParticipantInput = async () => {
    if (!isHostMode) return;

    try {
      const names = participantInput.split("\n").filter((name) => name.trim());
      const newParticipants = names.map((name, index) => ({
        id: Date.now() + index,
        name: name.trim(),
      }));

      // Clear both tables and insert new participants
      await Promise.all([
        supabase.from("participants").delete().neq("id", 0),
        supabase.from("selected_participants").delete().neq("id", 0),
      ]);

      await supabase.from("participants").insert(newParticipants);

      // Broadcast update event to all clients
      await supabase.channel("participant-update").send({
        type: "broadcast",
        event: "update",
        payload: { participants: newParticipants },
      });

      toast.success("Đã cập nhật danh sách người chơi");
    } catch (error) {
      console.error("Error updating participants:", error);
      toast.error("Lỗi khi cập nhật danh sách");
    }
  };

  const handleClearAll = async () => {
    if (!isHostMode) return;
    try {
      // Clear both tables
      await Promise.all([
        supabase.from("participants").delete().neq("id", 0),
        supabase.from("selected_participants").delete().neq("id", 0),
      ]);

      // Broadcast clear event to all clients
      await supabase.channel("clear-state").send({
        type: "broadcast",
        event: "clear",
        payload: { cleared: true },
      });

      // Clear local state
      setParticipantInput("");
      setAvailableParticipants([]);
      setSelectedParticipants([]);
      setResult("");
      setCurrentWinner(null);
      renderWheel();

      toast.success("Đã xóa toàn bộ danh sách");
    } catch (error) {
      console.error("Error clearing data:", error);
      toast.error("Lỗi khi xóa dữ liệu");
    }
  };

  // =============== Effect Hooks ===============
  // Audio Setup
  useEffect(() => {
    spinningSound.current = new Audio(spinningAudio);
    spinningSound.current.loop = true;
    winSound.current = new Audio(winnerAudio);

    return () => {
      spinningSound.current?.pause();
      winSound.current?.pause();
      spinningSound.current = null;
      winSound.current = null;
    };
  }, []);

  // Initial Data Load
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [participantsResponse, selectedResponse] = await Promise.all([
          supabase
            .from("participants")
            .select("*")
            .order("created_at", { ascending: true }),
          supabase
            .from("selected_participants")
            .select("*")
            .order("selected_at", { ascending: true }),
        ]);

        setAvailableParticipants(participantsResponse.data || []);
        if (participantsResponse.data) {
          setParticipantInput(
            participantsResponse.data
              .map((item: Participant) => item.name)
              .join("\n"),
          );
        }
        setSelectedParticipants(selectedResponse.data || []);
        setIsLoading(false);
      } catch (error) {
        console.error("Error loading initial data:", error);
        toast.error("Lỗi khi tải dữ liệu");
      }
    };

    loadInitialData();
  }, []);

  // Presence Channel Setup
  useEffect(() => {
    const channel = supabase.channel("online-users", {
      config: { presence: { key: userId.current } },
    });

    channel
      .on("presence", { event: "sync" }, () => {
        const users = Object.values(
          channel.presenceState(),
        ).flat() as unknown as OnlineUser[];
        setOnlineUsers(users);
      })
      .on("presence", { event: "join" }, () =>
        toast.success("Người dùng mới tham gia"),
      )
      .on("presence", { event: "leave" }, () =>
        toast.error("Người dùng đã rời đi"),
      )
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await channel.track({ last_seen: new Date().toISOString() });
        }
      });

    return () => {
      channel.unsubscribe();
    };
  }, []);

  // Realtime Database Subscriptions
  useEffect(() => {
    const participantsChannel = supabase
      .channel("participants-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "participants" },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setAvailableParticipants((prev) => [
              ...prev,
              payload.new as Participant,
            ]);
          } else if (payload.eventType === "DELETE") {
            setAvailableParticipants((prev) =>
              prev.filter((p) => p.id !== payload.old.id),
            );
          }
        },
      )
      .subscribe();

    const selectedChannel = supabase
      .channel("selected-changes")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "selected_participants" },
        (payload) =>
          setSelectedParticipants((prev) => [
            ...prev,
            payload.new as Participant,
          ]),
      )
      .subscribe();

    return () => {
      participantsChannel.unsubscribe();
      selectedChannel.unsubscribe();
    };
  }, []);

  // State Synchronization
  useEffect(() => {
    const spinChannel = supabase
      .channel("spin-state")
      .on("broadcast", { event: "spin" }, (payload) => {
        const spinState = payload.payload.spinState as SpinState;
        handleSpinAnimation(spinState);
      })
      .subscribe();

    const clearChannel = supabase
      .channel("clear-state")
      .on("broadcast", { event: "clear" }, () => {
        setParticipantInput("");
        setAvailableParticipants([]);
        setSelectedParticipants([]);
        setResult("");
        setCurrentWinner(null);
        renderWheel();
        toast.info("Danh sách đã được xóa bởi chủ phòng");
      })
      .subscribe();

    const participantUpdateChannel = supabase
      .channel("participant-update")
      .on("broadcast", { event: "update" }, (payload) => {
        const { participants } = payload.payload;
        setAvailableParticipants(participants);
        setParticipantInput(
          participants.map((item: Participant) => item.name).join("\n"),
        );
        setSelectedParticipants([]);
        setResult("");
        renderWheel();
        toast.info("Danh sách người chơi đã được cập nhật");
      })
      .subscribe();

    return () => {
      spinChannel.unsubscribe();
      clearChannel.unsubscribe();
      participantUpdateChannel.unsubscribe();
    };
  }, [handleSpinAnimation, renderWheel]);

  // Wheel Rendering
  useEffect(() => {
    if (availableParticipants.length > 0) {
      renderWheel();
    }
  }, [availableParticipants.length, renderWheel]);

  // =============== Render ===============
  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <div className="font-bangers text-2xl tracking-widest">Đang tải...</div>
      </div>
    );
  }

  return (
    <>
      <div className="flex min-h-screen w-full flex-col font-bangers md:flex-row">
        {/* Wheel Section */}
        <div className="relative flex w-full flex-col items-center justify-center border-b border-gray-200 p-4 pb-10 md:w-1/2 md:border-b-0 md:border-r md:pb-4">
          {/* Online Users Count */}
          <div className="absolute left-4 top-4 z-20 flex items-center gap-2 rounded-md bg-transparent px-3 py-1.5">
            <Users className="h-5 w-5" />
            <span>{onlineUsers.length} online</span>
          </div>

          {/* Exclude Input */}
          {isHostMode && (
            <div
              className="absolute right-4 top-4 z-20"
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
          )}

          {/* Wheel */}
          <div className="relative mx-auto aspect-square w-full max-w-[400px] md:max-w-[576px]">
            <button
              id="push"
              className="group absolute left-1/2 top-1/2 z-10 h-16 w-16 -translate-x-1/2 -translate-y-1/2 transform md:h-24 md:w-24"
              disabled={!isHostMode}
            >
              <div className="absolute left-0 top-0 h-14 w-14 transform rounded-full border border-black bg-white transition-transform duration-200 ease-linear group-hover:translate-x-1 group-hover:translate-y-1 group-active:hidden md:h-20 md:w-20">
                <Shell className="absolute left-[calc(50%-16px)] top-[calc(50%-16px)] h-8 w-8 text-[#380f0f] md:left-[calc(50%-20px)] md:top-[calc(50%-20px)] md:h-10 md:w-10" />
              </div>
              <div className="absolute left-2 top-2 z-[-1] h-14 w-14 rounded-full border border-black bg-[#ebd4f3] shadow-[8px_8px_0px_0px_rgba(186,172,191,0.35)] transition-shadow duration-200 ease-linear group-hover:shadow-[4px_4px_0px_0px_rgba(186,172,191,0.35)] group-active:bg-white group-active:shadow-[inset_5px_5px_0px_0px_transparent] md:h-20 md:w-20 md:shadow-[10px_10px_0px_0px_rgba(186,172,191,0.35)] md:group-hover:shadow-[5px_5px_0px_0px_rgba(186,172,191,0.35)]">
                <Shell className="absolute left-[calc(50%-16px)] top-[calc(50%-16px)] h-8 w-8 text-[#380f0f] md:left-[calc(50%-20px)] md:top-[calc(50%-20px)] md:h-10 md:w-10" />
              </div>
            </button>
            <div
              id="chart"
              className="relative inline-block aspect-square w-full max-w-[400px] md:max-w-[576px]"
            >
              <div className="absolute left-0 top-0 z-[-1] h-full w-full rounded-full border border-black bg-white" />
              <div className="absolute left-2 top-2 z-[-2] h-full w-full translate-x-[10px] translate-y-[10px] transform rounded-full border border-black bg-[#ebd4f3] shadow-[10px_10px_0px_0px_rgba(186,172,191,0.35)]" />
            </div>
          </div>
        </div>

        {/* Controls Section */}
        <div className="flex w-full flex-col gap-4 p-4 pt-6 md:w-1/2 md:p-8 md:pt-4">
          {/* Host Mode Toggle */}
          <Button
            className="mb-4 w-full md:absolute md:right-4 md:top-4 md:w-auto"
            variant="outline"
            onClick={() => setShowHostModal(true)}
          >
            {isHostMode ? (
              <>
                <KeyRound className="h-4 w-4" />
                <span>Chế độ chủ</span>
              </>
            ) : (
              <>
                <Eye className="h-4 w-4" />
                <span>Chế độ xem</span>
              </>
            )}
          </Button>

          {/* Participant Input */}
          <div className="flex flex-col gap-4">
            <h2 className="text-xl md:text-2xl">Danh sách người tham gia</h2>
            <Textarea
              placeholder="Nhập tên người tham gia (mỗi người một dòng)"
              value={participantInput}
              onChange={(e) => setParticipantInput(e.target.value)}
              className="h-32 md:h-48"
              disabled={!isHostMode}
            />
            <Button
              onClick={handleParticipantInput}
              disabled={!isHostMode}
              className="w-full"
            >
              Cập nhật danh sách
            </Button>
            {isHostMode && (
              <Button
                className="w-full"
                variant="destructive"
                onClick={handleClearAll}
              >
                Xóa tất cả
              </Button>
            )}
          </div>

          {/* Results Display */}
          <div className="rounded-lg border border-gray-200 p-4">
            <div className="mb-2 text-xl md:text-2xl">KẾT QUẢ: {result}</div>
            <div className="text-sm">
              Số người còn lại: {availableParticipants.length}
            </div>
          </div>

          {/* History Section */}
          <div className="max-h-40 overflow-y-auto rounded-lg border border-gray-200 p-4 md:max-h-48">
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
                    {participant.selected_at && (
                      <span className="text-sm text-gray-500">
                        {formatTime(new Date(participant.selected_at))}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Modals */}
        <HostModal
          isOpen={showHostModal}
          onOpenChange={setShowHostModal}
          onHostAuthenticated={() => setIsHostMode(true)}
          hostCode={hostCode}
          setHostCode={setHostCode}
        />
        <WinnerModal
          isOpen={showWinnerModal}
          onOpenChange={setShowWinnerModal}
          winner={currentWinner}
          remainingParticipants={availableParticipants.length}
          onClose={() => {
            if (availableParticipants.length === 1) {
              setShowGrandPrizeModal(true);
            }
          }}
        />
        <GrandPrizeModal
          isOpen={showGrandPrizeModal}
          onOpenChange={setShowGrandPrizeModal}
          winner={availableParticipants[0]}
        />
      </div>
      <Toaster richColors />
    </>
  );
};

export default WheelComponent;
