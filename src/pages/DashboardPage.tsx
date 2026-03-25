import { useRoutes } from "@/hooks/useRoutes";
import { RouteCard } from "@/components/RouteCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { type Route } from "@/lib/api";

interface SortableRouteCardProps {
  route: Route;
  onDelete: () => void;
}

function SortableRouteCard({ route, onDelete }: SortableRouteCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: route.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : undefined,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <RouteCard
        route={route}
        showDelete
        onDelete={onDelete}
        dragHandleProps={{ ...attributes, ...listeners } as React.HTMLAttributes<HTMLButtonElement>}
      />
    </div>
  );
}

export function DashboardPage() {
  const { routes, loading, deleteRoute, reorderRoutes } = useRoutes();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 250, tolerance: 5 },
    })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = routes.findIndex(r => r.id === active.id);
      const newIndex = routes.findIndex(r => r.id === over.id);
      reorderRoutes(arrayMove(routes, oldIndex, newIndex));
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-black text-foreground">Dashboard</h1>
        <Link to="/add-line">
          <Button size="sm">+ Adauga linie</Button>
        </Link>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-[88px] w-full rounded-xl bg-card" />
          ))}
        </div>
      ) : routes.length === 0 ? (
        <div className="bg-card border border-border rounded-2xl p-8 text-center">
          <p className="text-muted-foreground text-sm mb-4">
            Nu ai nicio ruta salvata.
          </p>
          <Link to="/add-line">
            <Button>Adauga prima ruta</Button>
          </Link>
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={routes.map(r => r.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-3">
              {routes.map((route) => (
                <SortableRouteCard
                  key={route.id}
                  route={route}
                  onDelete={async () => {
                    if (confirm(`Stergi ${route.routeNumber.toUpperCase()} - ${route.stationName}?`)) {
                      await deleteRoute(route.id);
                    }
                  }}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}
