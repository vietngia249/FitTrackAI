import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Search,
  Plus,
  Dumbbell,
  RotateCcw,
  Activity,
  ChevronDown,
  Check,
} from 'lucide-react';
import { Exercise, ExerciseQueryFilters } from '../features/exercises/exerciseTypes';
import { fetchExercises } from '../features/exercises/exerciseApi';
import { ExerciseCard } from '../features/exercises/ExerciseCard';
import { ExerciseDetailModal } from '../features/exercises/ExerciseDetailModal';
import { CreateExerciseModal } from '../features/exercises/CreateExerciseModal';
import { useAuth } from '../features/auth/AuthContext';

const MUSCLE_GROUPS = [
  'all',
  'chest',
  'quadriceps',
  'hamstrings',
  'biceps',
  'triceps',
  'shoulders',
  'lats',
  'abdominals',
  'glutes',
];

export const ExercisesPage: React.FC = () => {
  const { t } = useTranslation();
  const { user, accessToken, openLoginModal } = useAuth();

  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const PAGE_SIZE = 48;

  // Filter states
  const [search, setSearch] = useState('');
  const [selectedMuscle, setSelectedMuscle] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedEquipment, setSelectedEquipment] = useState('all');
  const [selectedLevel, setSelectedLevel] = useState('all');

  // Modals
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const getActiveFilters = (): ExerciseQueryFilters => ({
    search: search.trim() || undefined,
    muscle: selectedMuscle !== 'all' ? selectedMuscle : undefined,
    category: selectedCategory !== 'all' ? selectedCategory : undefined,
    equipment: selectedEquipment !== 'all' ? selectedEquipment : undefined,
    level: selectedLevel !== 'all' ? selectedLevel : undefined,
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const filters = getActiveFilters();
      const res = await fetchExercises(filters, accessToken, PAGE_SIZE, 0);
      setExercises(res.items);
      setTotalCount(res.total);
    } catch {
      // Graceful fallback
    } finally {
      setLoading(false);
    }
  };

  const handleLoadMore = async () => {
    if (loadingMore || exercises.length >= totalCount) return;
    setLoadingMore(true);
    try {
      const filters = getActiveFilters();
      const nextOffset = exercises.length;
      const res = await fetchExercises(filters, accessToken, PAGE_SIZE, nextOffset);
      setExercises((prev) => {
        // Prevent accidental duplicate IDs
        const existingIds = new Set(prev.map((e) => e.id));
        const newUnique = res.items.filter((e) => !existingIds.has(e.id));
        return [...prev, ...newUnique];
      });
      setTotalCount(res.total);
    } catch {
      // Graceful error ignore
    } finally {
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      loadData();
    }, 250);
    return () => clearTimeout(timer);
  }, [search, selectedMuscle, selectedCategory, selectedEquipment, selectedLevel, accessToken]);

  const handleResetFilters = () => {
    setSearch('');
    setSelectedMuscle('all');
    setSelectedCategory('all');
    setSelectedEquipment('all');
    setSelectedLevel('all');
  };

  const handleOpenCreate = () => {
    if (!user) {
      openLoginModal();
    } else {
      setIsCreateModalOpen(true);
    }
  };

  const handleExerciseCreated = (newEx: Exercise) => {
    setExercises((prev) => [newEx, ...prev]);
    setTotalCount((prev) => prev + 1);
    setSelectedExercise(newEx);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-500/10 via-slate-50 to-white dark:from-emerald-950/40 dark:via-slate-900 dark:to-slate-900 border border-slate-200 dark:border-slate-800/80 p-6 sm:p-8 shadow-sm dark:shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
              <Dumbbell className="w-3.5 h-3.5" />
              <span>{t('exercises.verified_badge')}</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {t('exercises.title')}
            </h1>
            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
              {t('exercises.subtitle')}
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={handleOpenCreate}
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-semibold text-sm shadow-lg shadow-emerald-500/20 flex items-center gap-2 transition-all hover:scale-[1.02] cursor-pointer keep-white active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>{t('exercises.add_custom')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter Bar & Search */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('exercises.search_ph')}
              className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white dark:bg-[#0e131f] border border-slate-200 dark:border-slate-800 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition shadow-sm"
            />
          </div>

          {/* Dropdown Filters */}
          <div className="flex flex-wrap sm:flex-nowrap gap-2.5">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2.5 rounded-xl bg-white dark:bg-[#0e131f] border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-200 focus:outline-none focus:border-emerald-500 capitalize shadow-sm cursor-pointer"
            >
              <option value="all">{t('exercises.all_categories')}</option>
              <option value="strength">{t('exercises.cat_strength')}</option>
              <option value="cardio">{t('exercises.cat_cardio')}</option>
              <option value="stretching">{t('exercises.cat_stretching')}</option>
              <option value="plyometrics">{t('exercises.cat_plyometrics')}</option>
            </select>

            <select
              value={selectedEquipment}
              onChange={(e) => setSelectedEquipment(e.target.value)}
              className="px-3 py-2.5 rounded-xl bg-white dark:bg-[#0e131f] border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-200 focus:outline-none focus:border-emerald-500 capitalize shadow-sm cursor-pointer"
            >
              <option value="all">{t('exercises.all_equipment')}</option>
              <option value="body only">{t('exercises.equip_body_only')}</option>
              <option value="barbell">{t('exercises.equip_barbell')}</option>
              <option value="dumbbell">{t('exercises.equip_dumbbell')}</option>
              <option value="cable">{t('exercises.equip_cable')}</option>
              <option value="machine">{t('exercises.equip_machine')}</option>
              <option value="bands">{t('exercises.equip_bands')}</option>
            </select>

            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="px-3 py-2.5 rounded-xl bg-white dark:bg-[#0e131f] border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-200 focus:outline-none focus:border-emerald-500 capitalize shadow-sm cursor-pointer"
            >
              <option value="all">{t('exercises.all_levels')}</option>
              <option value="beginner">{t('exercises.lvl_beginner')}</option>
              <option value="intermediate">{t('exercises.lvl_intermediate')}</option>
              <option value="expert">{t('exercises.lvl_expert')}</option>
            </select>

            {(search ||
              selectedMuscle !== 'all' ||
              selectedCategory !== 'all' ||
              selectedEquipment !== 'all' ||
              selectedLevel !== 'all') && (
              <button
                onClick={handleResetFilters}
                className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium flex items-center gap-1.5 transition cursor-pointer shadow-sm"
                title="Reset filters"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{t('exercises.reset')}</span>
              </button>
            )}
          </div>
        </div>

        {/* Muscle Group Pills Carousel/Tags */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
          {MUSCLE_GROUPS.map((muscle) => {
            const isActive = selectedMuscle === muscle;
            return (
              <button
                key={muscle}
                onClick={() => setSelectedMuscle(muscle)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap capitalize transition-all cursor-pointer ${
                  isActive
                    ? 'bg-emerald-500 text-white font-bold shadow-md shadow-emerald-500/20'
                    : 'bg-white dark:bg-[#0e131f] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 border border-slate-200 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700 shadow-sm'
                }`}
              >
                {muscle === 'all' ? t('exercises.all_muscles') : muscle}
              </button>
            );
          })}
        </div>
      </div>

      {/* Results Count & Grid */}
      <div>
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-4 px-1">
          <span>
            {t('exercises.showing_results', { count: exercises.length, total: totalCount })}
          </span>
          {loading && (
            <span className="text-emerald-600 dark:text-emerald-400 animate-pulse flex items-center gap-1">
              <Activity className="w-3.5 h-3.5" /> {t('exercises.loading_library')}
            </span>
          )}
        </div>

        {exercises.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {exercises.map((exercise) => (
                <ExerciseCard
                  key={exercise.id}
                  exercise={exercise}
                  onSelect={(ex) => setSelectedExercise(ex)}
                />
              ))}
            </div>

            {/* Load More Pagination Button */}
            {exercises.length < totalCount ? (
              <div className="flex flex-col items-center justify-center pt-8 pb-4 gap-3">
                <button
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  className="px-6 py-3 rounded-2xl bg-white dark:bg-[#0e131f] border border-slate-200 dark:border-slate-800 hover:border-emerald-500/50 dark:hover:border-emerald-500/50 shadow-sm hover:shadow-md text-sm font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2.5 transition-all hover:scale-[1.02] active:scale-95 cursor-pointer disabled:opacity-60"
                >
                  {loadingMore ? (
                    <>
                      <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                      <span>{t('exercises.loading_more', 'Loading more exercises...')}</span>
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-4 h-4 text-emerald-500" />
                      <span>
                        {t('exercises.load_more', {
                          count: Math.min(PAGE_SIZE, totalCount - exercises.length),
                          defaultValue: `Load More Movements (+${Math.min(PAGE_SIZE, totalCount - exercises.length)})`,
                        })}
                      </span>
                    </>
                  )}
                </button>
                <span className="text-[11px] text-slate-400 dark:text-slate-500 font-mono">
                  {exercises.length} / {totalCount}
                </span>
              </div>
            ) : totalCount > 0 ? (
              <div className="flex items-center justify-center gap-2 pt-8 pb-4 text-xs text-slate-400 dark:text-slate-500">
                <Check className="w-4 h-4 text-emerald-500" />
                <span>
                  {t('exercises.all_loaded', {
                    total: totalCount,
                    defaultValue: `All ${totalCount} movements loaded`,
                  })}
                </span>
              </div>
            ) : null}
          </>
        ) : (
          <div className="p-12 text-center rounded-3xl bg-white dark:bg-[#0e131f] border border-slate-200/80 dark:border-slate-800/80 max-w-lg mx-auto shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800/60 text-slate-400 flex items-center justify-center mx-auto mb-3">
              <Dumbbell className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-800 dark:text-slate-200 text-base mb-1">{t('exercises.no_exercises')}</h3>
            <p className="text-slate-500 dark:text-slate-400 text-xs mb-4">
              {t('exercises.no_exercises_desc')}
            </p>
            <button
              onClick={handleResetFilters}
              className="px-4 py-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-xs font-semibold hover:bg-emerald-500/20 transition cursor-pointer"
            >
              {t('exercises.clear_filters')}
            </button>
          </div>
        )}
      </div>

      {/* Exercise Detail Modal */}
      <ExerciseDetailModal
        exercise={selectedExercise}
        onClose={() => setSelectedExercise(null)}
      />

      {/* Create Custom Exercise Modal */}
      <CreateExerciseModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreated={handleExerciseCreated}
      />
    </div>
  );
};
