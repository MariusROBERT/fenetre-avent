<script module>
	import * as maplibregl from 'maplibre-gl';
	import maplibreWorkerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url';

	maplibregl.setWorkerUrl(maplibreWorkerUrl);
</script>

<script>
	import { resolve } from '$app/paths';
	import { MapLibre, Marker } from 'svelte-maplibre';
	import { Button } from '#lib/components/ui/button/index.js';
	import { Dialog } from '#lib/components/ui/dialog/index.js';
	import { Input } from '#lib/components/ui/input/index.js';
	import { Label } from '#lib/components/ui/label/index.js';
	import { siteConfig } from '#lib/config/site.js';

	/** @type {{data: import('./$types').PageData}} */
	let { data } = $props();
	let dialogOpen = $state(false);
	let selectedDate = $state('');
	/** @type {HTMLButtonElement | null} */
	let selectedTrigger = $state(null);

	let selectedDay = $derived(data.days.find((day) => day.date === selectedDate) ?? null);
	let copyMessage = $state('');

	const dateFormatter = new Intl.DateTimeFormat('fr-FR', {
		day: 'numeric',
		month: 'long',
		year: 'numeric',
		timeZone: 'Europe/Paris'
	});

	/** @param {string} date */
	function formatDate(date) {
		return dateFormatter.format(new Date(`${date}T12:00:00Z`));
	}

	/** @param {typeof data.days[number]} day @param {MouseEvent} event */
	function openDay(day, event) {
		selectedDate = day.date;
		selectedTrigger = /** @type {HTMLButtonElement} */ (event.currentTarget);
		dialogOpen = true;
	}

	/** @param {typeof data.days[number]} day @returns {(event: MouseEvent) => void} */
	function openDayHandler(day) {
		return (event) => openDay(day, event);
	}

	/** @type {Record<string, string>} */
	const stateLabels = {
		available: 'Disponible',
		reserved: 'Réservée',
		past: 'Passée — libre'
	};
	/** @type {Record<string, string>} */
	const stateClasses = {
		available: 'border-green-700 bg-green-100',
		reserved: 'border-amber-700 bg-amber-100',
		past: 'border-slate-500 bg-slate-200'
	};

	$effect(() => {
		if (data.initialDate) {
			selectedDate = data.initialDate;
			dialogOpen = true;
		}
	});

	async function copyCalendarUrl() {
		try {
			await navigator.clipboard.writeText(data.calendarUrl);
			copyMessage = 'Lien copié.';
		} catch {
			copyMessage = 'Copiez le lien affiché dans le champ.';
		}
	}
</script>

<svelte:head>
	<meta
		name="description"
		content={`Calendrier des fenêtres de l’Avent ${data.year} — ${siteConfig.municipality.name}.`}
	/>
</svelte:head>

<main class="mx-auto min-h-screen max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
	<header class="mb-8 text-center">
		<p class="font-medium text-emerald-800">{siteConfig.municipality.name}</p>
		<h1 class="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
			Fenêtres de l’Avent {data.year}
		</h1>
		<p class="mx-auto mt-3 max-w-2xl text-slate-600">
			Découvrez les fenêtres décorées du 1<sup>er</sup> au 24 décembre, ou choisissez une date libre pour
			participer.
		</p>
	</header>

	<ul
		class="mb-5 flex list-none flex-wrap justify-center gap-x-5 gap-y-2 p-0 text-sm text-slate-700"
		aria-label="Légende des dates"
	>
		<li><span aria-hidden="true" class="text-green-700">●</span> Disponible</li>
		<li><span aria-hidden="true" class="text-amber-700">●</span> Réservée</li>
		<li><span aria-hidden="true" class="text-slate-500">●</span> Passée</li>
	</ul>

	<section aria-label={`Calendrier de l’Avent ${data.year}`}>
		<div class="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
			{#each data.days as day (day.date)}
				<Button
					type="button"
					variant="ghost"
					class={`min-h-28 rounded-xl border-2 p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:bg-transparent hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700 dark:hover:bg-transparent ${stateClasses[day.state]}`}
					aria-label={`${formatDate(day.date)}, ${stateLabels[day.state]}`}
					onclick={openDayHandler(day)}
				>
					<span class="block text-2xl font-bold text-slate-900">{Number(day.date.slice(-2))}</span>
					<span class="mt-2 block text-sm font-medium text-slate-700">{stateLabels[day.state]}</span
					>
				</Button>
			{/each}
		</div>
	</section>

	<p class="mt-8 text-center text-sm text-slate-600">
		<a class="underline underline-offset-4 hover:text-emerald-800" href={resolve('/rules')}
			>Lire le règlement</a
		>
	</p>

	<section class="mt-10 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
		<h2 class="text-xl font-semibold text-slate-900">S’abonner au calendrier</h2>
		<p class="mt-2 text-slate-700">
			Ajoutez le flux à votre application pour recevoir les mises à jour. L’importation d’un fichier
			est ponctuelle et ne se synchronise pas.
		</p>
		<ul class="mt-3 list-disc space-y-1 pl-5 text-sm text-slate-700">
			<li>Google Agenda : « Ajouter un agenda » puis « À partir d’une URL ».</li>
			<li>Apple Calendrier : « Fichier » puis « Nouvel abonnement au calendrier ».</li>
			<li>Outlook : « Ajouter un calendrier » puis « S’abonner à partir du Web ».</li>
		</ul>
		<Label class="mt-4 block text-sm font-medium" for="calendar-url">Lien d’abonnement</Label>
		<div class="mt-1 flex flex-col gap-2 sm:flex-row">
			<Input
				class="h-12 min-w-0 flex-1 rounded-lg p-3"
				id="calendar-url"
				type="url"
				value={data.calendarUrl}
				readonly
			/>
			<Button
				variant="outline"
				class="min-h-11 rounded-lg border-slate-300 px-4 font-medium hover:bg-slate-50"
				type="button"
				onclick={copyCalendarUrl}
			>
				Copier le lien
			</Button>
			<Button class="min-h-11 rounded-lg px-4 font-medium" href={resolve('/calendar.ics')}>
				Ouvrir le flux
			</Button>
		</div>
		<p class="mt-2 text-sm text-slate-600" aria-live="polite">{copyMessage}</p>
	</section>
</main>

<Dialog.Root bind:open={dialogOpen}>
	<Dialog.Portal>
		<Dialog.Overlay class="fixed inset-0 z-40 bg-slate-950/50" />
		<Dialog.Content
			class="fixed top-1/2 left-1/2 z-50 max-h-[85vh] w-[calc(100%-2rem)] max-w-xl -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-xl border border-slate-200 bg-white p-6 shadow-xl"
			onCloseAutoFocus={(event) => {
				if (selectedTrigger) {
					event.preventDefault();
					selectedTrigger.focus();
				}
			}}
		>
			{#if selectedDay}
				<Dialog.Title class="text-xl font-semibold text-slate-900">
					{formatDate(selectedDay.date)}
				</Dialog.Title>
				<Dialog.Description class="mt-1 text-sm text-slate-600">
					{stateLabels[selectedDay.state]}
				</Dialog.Description>

				{#if selectedDay.registration}
					<div class="mt-5 space-y-3">
						<h2 class="text-lg font-semibold">{selectedDay.registration.name}</h2>
						<p class="whitespace-pre-wrap text-slate-700">{selectedDay.registration.description}</p>
						<p class="text-slate-700">{selectedDay.registration.address}</p>
						<div
							class="h-60 w-full overflow-hidden rounded-lg border border-slate-200"
							role="region"
							aria-label={`Carte de localisation pour ${selectedDay.registration.address}`}
						>
							<MapLibre
								center={[selectedDay.registration.longitude, selectedDay.registration.latitude]}
								zoom={15}
								minZoom={11}
								maxZoom={19}
								maxBounds={siteConfig.municipality.mapBounds}
								cooperativeGestures
								standardControls
								style={siteConfig.mapStyle}
								class="h-full w-full"
							>
								<Marker
									lngLat={[selectedDay.registration.longitude, selectedDay.registration.latitude]}
								>
									<span
										class="grid size-8 place-items-center rounded-full border-2 border-white bg-emerald-800 text-lg text-white shadow-md"
									>
										<span aria-hidden="true">●</span>
									</span>
								</Marker>
							</MapLibre>
						</div>
						<a
							class="text-sm underline underline-offset-4"
							href={`https://www.openstreetmap.org/?mlat=${selectedDay.registration.latitude}&mlon=${selectedDay.registration.longitude}#map=17/${selectedDay.registration.latitude}/${selectedDay.registration.longitude}`}
							target="_blank"
							rel="noreferrer">Ouvrir la carte dans OpenStreetMap</a
						>
					</div>
				{:else if selectedDay.state === 'available'}
					<p class="mt-5 text-slate-700">Cette date est libre. Les inscriptions sont ouvertes.</p>
					<Button
						class="mt-5 min-h-11 rounded-lg px-5 font-semibold"
						href={resolve('/register/[date]', { date: selectedDay.date })}
					>
						S’inscrire
					</Button>
				{:else}
					<p class="mt-5 text-slate-700">Aucune fenêtre n’a été inscrite pour cette date.</p>
				{/if}

				<Dialog.Close
					class="ml-3 inline-flex min-h-11 items-center rounded-lg border border-slate-300 px-4 font-medium hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-800"
				>
					Fermer
				</Dialog.Close>
			{/if}
		</Dialog.Content>
	</Dialog.Portal>
</Dialog.Root>
