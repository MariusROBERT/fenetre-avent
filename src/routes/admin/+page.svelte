<script>
	import { invalidateAll } from '$app/navigation';
	import { Button } from '#lib/components/ui/button/index.js';
	import { Dialog } from '#lib/components/ui/dialog/index.js';
	import LocationPicker from '#lib/components/LocationPicker.svelte';
	import { siteConfig } from '#lib/config/site.js';
	/** @typedef {NonNullable<import('./$types').PageData['registrations']>[number]} Entry */
	let { data } = $props();
	let loginName = $state('');
	let password = $state('');
	let busy = $state(false);
	/** @type {{message: string, kind: 'success' | 'error'} | null} */ let toast = $state(null);
	let detailsOpen = $state(false);
	let selectedDate = $state('');
	/** @type {Entry | null} */ let editing = $state(null);
	/** @type {Entry | null} */ let draft = $state(null);
	const labels = {
		date: 'Date',
		name: 'Nom',
		email: 'E-mail',
		phone: 'Téléphone',
		description: 'Description',
		address: 'Adresse',
		latitude: 'Latitude',
		longitude: 'Longitude',
		status: 'Statut',
		id: 'Identifiant',
		rulesAcceptedAt: 'Règlement accepté le',
		rulesVersion: 'Version du règlement',
		createdAt: 'Créée le',
		updatedAt: 'Mise à jour le',
		privacyAcceptedAt: 'Politique acceptée le',
		privacyVersion: 'Version de la politique'
	};
	/** @param {string} key */ const labelFor = (key) =>
		/** @type {Record<string, string>} */ (labels)[key] ?? key;
	/** @type {(keyof typeof labels)[]} */ const fields = [
		'date',
		'name',
		'email',
		'phone',
		'description',
		'status'
	];
	/** @param {string} date */ const formatDate = (date) =>
		new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long' }).format(
			new Date(`${date}T12:00:00Z`)
		);
	const byDate = $derived(new Map((data.registrations ?? []).map((entry) => [entry.date, entry])));
	const selectedEntry = $derived(byDate.get(selectedDate) ?? null);
	const stateClasses = {
		available: 'border-[#91B99D] bg-[#DAE8D8] hover:bg-[#DAE8D8]',
		reserved: 'border-[#D6B56E] bg-[#FFF1CC] hover:bg-[#FFF1CC]',
		past: 'border-[#A5B6AA] bg-[#E6EDE4] hover:bg-[#E6EDE4]'
	};
	/** @param {string} date */ function openDay(date) {
		selectedDate = date;
		detailsOpen = true;
	}
	/** @param {string} message @param {'success' | 'error'} kind */ function notify(message, kind) {
		toast = { message, kind };
		setTimeout(() => (toast = null), 4000);
	}
	/** @param {SubmitEvent} event */ async function login(event) {
		event.preventDefault();
		busy = true;
		try {
			const response = await fetch('/api/admin/login', {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({ login: loginName, password })
			});
			if (!response.ok) throw new Error();
			await invalidateAll();
		} catch {
			notify('Identifiants invalides.', 'error');
		} finally {
			busy = false;
		}
	}
	async function logout() {
		await fetch('/api/auth/sign-out', { method: 'POST' });
		await invalidateAll();
	}
	/** @param {Entry} entry */ function edit(entry) {
		detailsOpen = false;
		editing = entry;
		draft = { ...entry, email: entry.email ?? '', phone: entry.phone ?? '' };
		toast = null;
	}
	async function save() {
		if (!draft) return;
		busy = true;
		try {
			const response = await fetch('/api/admin/registrations', {
				method: 'PUT',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({
					...draft,
					email: draft.email ?? '',
					phone: draft.phone ?? '',
					latitude: Number(draft.latitude),
					longitude: Number(draft.longitude)
				})
			});
			if (!response.ok)
				throw new Error((await response.json()).message ?? 'Modification impossible.');
			editing = null;
			selectedDate = '';
			notify('Modifications enregistrées.', 'success');
			await invalidateAll();
		} catch (error) {
			notify(error instanceof Error ? error.message : 'Modification impossible.', 'error');
		} finally {
			busy = false;
		}
	}
	/** @param {Entry} entry */ async function remove(entry) {
		if (!confirm(`Supprimer définitivement l'inscription de ${entry.name} ?`)) return;
		busy = true;
		try {
			const response = await fetch('/api/admin/registrations', {
				method: 'DELETE',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({ id: entry.id })
			});
			if (!response.ok) throw new Error('Suppression impossible.');
			notify('Inscription supprimée.', 'success');
			detailsOpen = false;
			selectedDate = '';
			await invalidateAll();
		} catch (error) {
			notify(error instanceof Error ? error.message : 'Suppression impossible.', 'error');
		} finally {
			busy = false;
		}
	}
</script>

<svelte:head
	><title>Administration — Fenêtres de l'Avent</title><meta
		name="robots"
		content="noindex, nofollow"
	/></svelte:head
>

<main class="mx-auto min-h-screen max-w-6xl px-4 py-10 text-[#FFF4DB] sm:px-6 lg:px-8">
	{#if !data.authenticated}
		<section class="mx-auto mt-16 max-w-md rounded-xl bg-[#FFF9ED] p-7 text-[#153D33] shadow-xl">
			<h1 class="text-2xl font-bold">Administration</h1>
			<p class="mt-2 text-slate-600">Connectez-vous pour gérer le calendrier.</p>
			<form class="mt-6 space-y-4" onsubmit={login}>
				<label class="block text-sm font-medium"
					>Identifiant<input
						class="mt-1 block min-h-11 w-full rounded border border-slate-300 bg-white px-3"
						type="text"
						bind:value={loginName}
						required
						autocomplete="username"
					/></label
				>
				<label class="block text-sm font-medium"
					>Mot de passe<input
						class="mt-1 block min-h-11 w-full rounded border border-slate-300 bg-white px-3"
						type="password"
						bind:value={password}
						required
						autocomplete="current-password"
					/></label
				>
				<Button class="min-h-11 w-full" type="submit" disabled={busy}
					>{busy ? 'Connexion…' : 'Se connecter'}</Button
				>
			</form>
		</section>
	{:else}
		<header class="mb-8 flex items-center justify-between gap-4">
			<div>
				<p class="font-medium text-[#D6B56E]">{siteConfig.municipality.name}</p>
				<h1 class="mt-1 text-3xl font-bold">Administration · Avent {data.year}</h1>
			</div>
			<Button variant="outline" class="min-h-11 text-[#153D33]" onclick={logout}>Déconnexion</Button
			>
		</header>
		<div class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
			{#each Array.from({ length: 24 }, (_, i) => `${data.year}-12-${String(i + 1).padStart(2, '0')}`) as date (date)}
				{@const entry = byDate.get(date)}
				{@const state =
					entry && entry.status !== 'cancelled'
						? 'reserved'
						: data.availableDates?.includes(date)
							? 'available'
							: 'past'}
				<Button
					variant="ghost"
					type="button"
					class={`min-h-28 w-full items-center justify-start gap-4 rounded-xl border-2 p-4 text-left shadow-md shadow-[#0A2B24]/15 transition hover:-translate-y-0.5 hover:shadow-lg hover:brightness-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D6B56E] dark:hover:brightness-95 ${stateClasses[state]}`}
					aria-label={`${formatDate(date)}${entry ? `, ${entry.name}, ${entry.address}` : ''}`}
					onclick={() => openDay(date)}
				>
					<span class="shrink-0 text-2xl font-bold text-[#153D33]">{Number(date.slice(-2))}</span>
					{#if entry}<span class="flex min-w-0 flex-1 flex-col text-left"
							><span class="text-sm font-semibold break-words text-[#153D33]">{entry.name}</span
							><span class="text-sm break-words text-[#153D33]">{entry.address}</span></span
						>{/if}
				</Button>
			{/each}
		</div>
	{/if}
</main>

<Dialog.Root bind:open={detailsOpen}>
	<Dialog.Portal>
		<Dialog.Overlay class="fixed inset-0 z-40 bg-slate-950/50" />
		<Dialog.Content
			class="fixed top-1/2 left-1/2 z-50 max-h-[85vh] w-[calc(100%-2rem)] max-w-xl -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-xl border border-[#D6B56E]/50 bg-[#FFF9ED] p-6 pr-14 text-[#153D33] shadow-xl"
		>
			<Dialog.Close
				class="absolute top-3 right-3 grid size-10 place-items-center rounded-lg hover:bg-[#DAE8D8]"
				aria-label="Fermer">×</Dialog.Close
			>
			<Dialog.Title class="text-xl font-semibold">{formatDate(selectedDate)}</Dialog.Title>
			{#if selectedEntry}
				<dl class="mt-5 grid gap-3 sm:grid-cols-2">
					{#each Object.entries(selectedEntry) as [key, value] (key)}
						<div class="min-w-0">
							<dt class="text-sm font-semibold text-slate-600">{labelFor(key)}</dt>
							<dd class="break-words whitespace-pre-wrap">{value ?? '—'}</dd>
						</div>
					{/each}
				</dl>
				<div class="mt-6 flex flex-wrap gap-2">
					<Button class="min-h-11" onclick={() => edit(selectedEntry)}>Modifier</Button>
					<Button
						variant="outline"
						class="min-h-11 text-red-800"
						onclick={() => remove(selectedEntry)}>Supprimer</Button
					>
				</div>
			{:else}<p class="mt-4 text-slate-600">Aucune inscription pour cette date.</p>{/if}
		</Dialog.Content>
	</Dialog.Portal>
</Dialog.Root>

{#if editing && draft}
	<div
		class="fixed inset-0 z-50 grid place-items-center bg-slate-950/60 p-4"
		role="presentation"
		onclick={(event) => {
			if (event.target === event.currentTarget) editing = null;
		}}
	>
		<div
			class="relative max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-xl bg-[#FFF9ED] p-6 pr-14 text-[#153D33]"
			role="dialog"
			aria-modal="true"
			aria-labelledby="edit-title"
			tabindex="-1"
		>
			<button
				type="button"
				class="absolute top-3 right-3 grid size-10 place-items-center rounded-lg hover:bg-[#DAE8D8]"
				aria-label="Fermer"
				onclick={() => (editing = null)}>×</button
			>
			<h2 id="edit-title" class="text-xl font-bold">Modifier · {formatDate(editing.date)}</h2>
			<form
				class="mt-4 grid gap-3 sm:grid-cols-2"
				onsubmit={(event) => {
					event.preventDefault();
					save();
				}}
			>
				{#each fields as field (field)}
					<label
						class={`block text-sm font-medium ${field === 'description' ? 'sm:col-span-2' : ''}`}
						>{labels[field]}
						{#if field === 'description'}<textarea
								class="mt-1 min-h-24 w-full rounded border border-slate-300 bg-white p-2"
								bind:value={draft[field]}
								required></textarea>
						{:else if field === 'status'}<select
								class="mt-1 min-h-11 w-full rounded border border-slate-300 bg-white px-2"
								bind:value={draft[field]}
								><option value="pending">En attente</option><option value="confirmed"
									>Confirmée</option
								><option value="cancelled">Annulée</option></select
							>
						{:else}<input
								class="mt-1 min-h-11 w-full rounded border border-slate-300 bg-white px-2"
								type={field === 'date'
									? 'date'
									: field === 'email'
										? 'email'
										: field === 'latitude' || field === 'longitude'
											? 'number'
											: 'text'}
								step={field === 'latitude' || field === 'longitude' ? 'any' : undefined}
								bind:value={draft[field]}
								required={['name', 'address', 'latitude', 'longitude'].includes(field)}
							/>{/if}
					</label>
				{/each}
				<div class="rounded-lg bg-[#153D33] p-4 sm:col-span-2">
					<LocationPicker
						bind:address={draft.address}
						bind:latitude={draft.latitude}
						bind:longitude={draft.longitude}
						errors={{}}
					/>
				</div>
				<div class="flex gap-2 sm:col-span-2">
					<Button type="submit" disabled={busy}>{busy ? 'Enregistrement…' : 'Enregistrer'}</Button
					><Button type="button" variant="outline" onclick={() => (editing = null)}>Annuler</Button>
				</div>
			</form>
		</div>
	</div>
{/if}

{#if toast}
	<div
		class={`fixed right-4 bottom-4 z-[60] max-w-sm rounded-lg px-4 py-3 shadow-lg ${toast.kind === 'error' ? 'bg-red-100 text-red-900' : 'bg-emerald-100 text-emerald-900'}`}
		role={toast.kind === 'error' ? 'alert' : 'status'}
	>
		{toast.message}
	</div>
{/if}
