<script module>
	import * as maplibregl from 'maplibre-gl';
	import maplibreWorkerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url';

	maplibregl.setWorkerUrl(maplibreWorkerUrl);
</script>

<script>
	import { onDestroy } from 'svelte';
	import { MapLibre, Marker } from 'svelte-maplibre';
	import { siteConfig } from '#lib/config/site.js';
	import { Button } from '#lib/components/ui/button/index.js';
	import { Input } from '#lib/components/ui/input/index.js';
	import { Label } from '#lib/components/ui/label/index.js';

	/** @typedef {{label: string, longitude: number, latitude: number}} AddressSuggestion */

	/** @type {{address: string, latitude: number, longitude: number, errors: Record<string, string[] | undefined>}} */
	let {
		address = $bindable(''),
		latitude = $bindable(siteConfig.municipality.mapCenter[1]),
		longitude = $bindable(siteConfig.municipality.mapCenter[0]),
		errors
	} = $props();

	/** @type {[number, number]} */
	let markerPosition = $state([longitude, latitude]);
	/** @type {[number, number]} */
	let mapCenter = $state([longitude, latitude]);
	/** @type {AddressSuggestion[]} */
	let suggestions = $state([]);
	let loading = $state(false);
	let searchError = $state('');
	/** @type {ReturnType<typeof setTimeout> | undefined} */
	let searchTimer;
	/** @type {AbortController | null} */
	let searchController = null;

	$effect(() => {
		longitude = markerPosition[0];
		latitude = markerPosition[1];
	});

	/** @param {Event} event */
	function handleAddressInput(event) {
		address = /** @type {HTMLInputElement} */ (event.currentTarget).value;
		clearTimeout(searchTimer);
		searchController?.abort();
		suggestions = [];
		searchError = '';

		const query = address.trim();
		if (query.length < 3) {
			loading = false;
			return;
		}

		searchTimer = setTimeout(() => void searchAddresses(query), 300);
	}

	/** @param {string} query */
	async function searchAddresses(query) {
		const controller = new AbortController();
		searchController = controller;
		loading = true;
		try {
			const response = await fetch(`/api/addresses?q=${encodeURIComponent(query)}`, {
				signal: controller.signal
			});
			const result = await response.json();
			if (!response.ok) throw new Error(result.error);
			suggestions = result.suggestions;
		} catch (error) {
			if (!(error instanceof Error) || error.name !== 'AbortError') {
				searchError = "La recherche est indisponible. Vous pouvez saisir l'adresse manuellement.";
			}
		} finally {
			if (searchController === controller) loading = false;
		}
	}

	/** @param {AddressSuggestion} suggestion */
	function selectSuggestion(suggestion) {
		clearTimeout(searchTimer);
		searchController?.abort();
		address = suggestion.label;
		markerPosition = [suggestion.longitude, suggestion.latitude];
		mapCenter = markerPosition;
		suggestions = [];
		searchError = '';
		loading = false;
	}

	function recenterOnCoordinates() {
		mapCenter = [longitude, latitude];
	}

	function updateMarkerFromInputs() {
		if (
			Number.isFinite(longitude) &&
			Number.isFinite(latitude) &&
			longitude >= -180 &&
			longitude <= 180 &&
			latitude >= -90 &&
			latitude <= 90
		) {
			markerPosition = [longitude, latitude];
		}
	}

	onDestroy(() => {
		clearTimeout(searchTimer);
		searchController?.abort();
	});
</script>

<div class="space-y-4">
	<div>
		<Label class="mb-1 block font-medium" for="address">Adresse de la fenêtre</Label>
		<div class="flex gap-2">
			<Input
				class="h-12 min-w-0 flex-1 rounded-lg border-[#DAE8D8]/70 p-3"
				id="address"
				name="address"
				type="text"
				bind:value={address}
				aria-invalid={Boolean(errors.address?.[0])}
				aria-describedby={errors.address?.[0] ? 'address-error' : undefined}
				autocomplete="street-address"
				aria-autocomplete="list"
				aria-controls="address-suggestions"
				aria-expanded={suggestions.length > 0}
				oninput={handleAddressInput}
				required
			/>
			<Button
				variant="outline"
				class="h-11 shrink-0 rounded-lg border-[#DAE8D8]/70 px-3 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-50"
				type="button"
				aria-label="Recentrer la carte sur les coordonnées GPS"
				disabled={!Number.isFinite(longitude) || !Number.isFinite(latitude)}
				onclick={recenterOnCoordinates}>Recentrer</Button
			>
		</div>
		{#if errors.address?.[0]}
			<p class="mt-1 text-sm text-[#F3ADB3]" id="address-error" aria-live="polite">
				{errors.address[0]}
			</p>
		{/if}
		{#if loading}
			<p class="mt-1 text-sm text-[#DAE8D8]" aria-live="polite">Recherche d'adresses…</p>
		{/if}
		{#if searchError}
			<p class="mt-1 text-sm text-[#F3ADB3]" role="status">{searchError}</p>
		{/if}
		{#if suggestions.length}
			<ul
				id="address-suggestions"
				class="mt-1 rounded-lg border border-[#D6B56E]/70 bg-[#FFF9ED] text-[#153D33] shadow-sm"
			>
				{#each suggestions as suggestion (suggestion.label)}
					<li>
						<Button
							variant="ghost"
							class="h-auto w-full justify-start px-3 py-2 text-left hover:bg-[#DAE8D8] hover:text-[#153D33] dark:hover:bg-[#DAE8D8]"
							type="button"
							onclick={() => selectSuggestion(suggestion)}
						>
							{suggestion.label}
						</Button>
					</li>
				{/each}
			</ul>
		{:else if address.trim().length >= 3 && !loading && !searchError}
			<p class="mt-1 text-sm text-[#DAE8D8]" role="status">
				Aucune suggestion trouvée. Vous pouvez garder votre saisie et placer le marqueur
				manuellement.
			</p>
		{/if}
	</div>

	<div>
		<p class="mb-2 text-sm text-[#DAE8D8]">
			Déplacez le marqueur jusqu'à l'emplacement de la fenêtre. Vous pouvez aussi ajuster les
			coordonnées ci-dessous.
		</p>
		<div class="h-80 overflow-hidden rounded-lg border border-[#DAE8D8]/70">
			<MapLibre
				bind:center={mapCenter}
				zoom={15}
				minZoom={11}
				maxZoom={19}
				maxBounds={siteConfig.municipality.mapBounds}
				standardControls
				style={siteConfig.mapStyle}
				class="h-full w-full"
			>
				<Marker bind:lngLat={markerPosition} draggable>
					<span
						class="grid size-8 touch-none place-items-center rounded-full border-2 border-white bg-emerald-800 text-lg text-white shadow-md"
					>
						<span aria-hidden="true">●</span>
					</span>
				</Marker>
			</MapLibre>
		</div>
	</div>

	<fieldset class="grid gap-4 sm:grid-cols-2">
		<legend class="mb-2 font-medium">Coordonnées GPS</legend>
		<div>
			<Label class="mb-1 block" for="latitude">Latitude</Label>
			<Input
				class="h-12 w-full rounded-lg border-[#DAE8D8]/70 p-3"
				id="latitude"
				name="latitude"
				aria-invalid={Boolean(errors.latitude?.[0])}
				aria-describedby={errors.latitude?.[0] ? 'latitude-error' : undefined}
				type="number"
				step="any"
				min="-90"
				max="90"
				value={latitude}
				oninput={(event) => {
					latitude = /** @type {HTMLInputElement} */ (event.currentTarget).valueAsNumber;
					updateMarkerFromInputs();
				}}
				required
			/>
			{#if errors.latitude?.[0]}
				<p class="mt-1 text-sm text-[#F3ADB3]" id="latitude-error" aria-live="polite">
					{errors.latitude[0]}
				</p>
			{/if}
		</div>
		<div>
			<Label class="mb-1 block" for="longitude">Longitude</Label>
			<Input
				class="h-12 w-full rounded-lg border-[#DAE8D8]/70 p-3"
				id="longitude"
				name="longitude"
				aria-invalid={Boolean(errors.longitude?.[0])}
				aria-describedby={errors.longitude?.[0] ? 'longitude-error' : undefined}
				type="number"
				step="any"
				min="-180"
				max="180"
				value={longitude}
				oninput={(event) => {
					longitude = /** @type {HTMLInputElement} */ (event.currentTarget).valueAsNumber;
					updateMarkerFromInputs();
				}}
				required
			/>
			{#if errors.longitude?.[0]}
				<p class="mt-1 text-sm text-[#F3ADB3]" id="longitude-error" aria-live="polite">
					{errors.longitude[0]}
				</p>
			{/if}
		</div>
	</fieldset>
</div>
