<script>
	import { resolve } from '$app/paths';
	import { tick } from 'svelte';
	import RulesContent from '#lib/components/RulesContent.svelte';
	import LocationPicker from '#lib/components/LocationPicker.svelte';
	import { siteConfig } from '#lib/config/site.js';
	import { registrationInputFromFormData, registrationSchema } from '#lib/schemas/registration.js';

	/** @type {{data: import('./$types').PageData, form: import('./$types').ActionData}} */
	let { data, form } = $props();
	/** @type {string[]} */
	let clientErrors = $state([]);
	/** @type {Record<string, string[] | undefined>} */
	let liveFieldErrors = $state({});
	/** @type {Record<string, boolean>} */
	let touchedFields = $state({});
	let submitAttempted = $state(false);
	let address = $state('');
	let latitude = $state(siteConfig.municipality.mapCenter[1]);
	let longitude = $state(siteConfig.municipality.mapCenter[0]);
	const fieldNames = [
		'name',
		'email',
		'phone',
		'description',
		'address',
		'latitude',
		'longitude',
		'rulesAccepted'
	];

	let fieldErrors = $derived.by(() => {
		/** @type {Record<string, string[] | undefined>} */
		const errors = { ...(form?.fieldErrors ?? {}) };
		for (const [field, touched] of Object.entries(touchedFields)) {
			if (!touched) continue;
			if (liveFieldErrors[field]?.length) errors[field] = liveFieldErrors[field];
			else delete errors[field];
		}
		return errors;
	});

	/** @param {string} field */
	function getFieldError(field) {
		return fieldErrors[field]?.[0] ?? '';
	}

	/** @param {Event} event */
	function validateField(event) {
		const field = /** @type {HTMLInputElement | HTMLTextAreaElement} */ (event.target).name;
		if (!fieldNames.includes(field)) return;

		touchedFields = {
			...touchedFields,
			[field]: true,
			...(field === 'email' || field === 'phone' ? { email: true, phone: true } : {})
		};
		const formElement = /** @type {HTMLFormElement} */ (event.currentTarget);
		const result = registrationSchema.safeParse(
			registrationInputFromFormData(new FormData(formElement))
		);
		liveFieldErrors = result.success ? {} : result.error.flatten().fieldErrors;
		if (submitAttempted)
			clientErrors = result.success ? [] : result.error.issues.map((issue) => issue.message);
	}

	/** @param {SubmitEvent & {currentTarget: HTMLFormElement}} event */
	function validateForm(event) {
		const formElement = event.currentTarget;
		submitAttempted = true;
		touchedFields = Object.fromEntries(fieldNames.map((field) => [field, true]));
		const result = registrationSchema.safeParse(
			registrationInputFromFormData(new FormData(formElement))
		);
		if (!result.success) {
			event.preventDefault();
			liveFieldErrors = result.error.flatten().fieldErrors;
			clientErrors = result.error.issues.map((issue) => issue.message);
			void tick().then(() => {
				const firstInvalidField = formElement.querySelector('[aria-invalid="true"]');
				if (firstInvalidField instanceof HTMLElement) firstInvalidField.focus();
			});
			return;
		}
		liveFieldErrors = {};
		clientErrors = [];
	}
</script>

<svelte:head>
	<title>Inscription — {siteConfig.name}</title>
</svelte:head>

<main class="mx-auto max-w-2xl px-4 py-10 sm:px-6">
	<a class="text-sm underline underline-offset-4" href={resolve('/')}>Retour au calendrier</a>
	<h1 class="mt-6 text-3xl font-bold">Inscription pour le {data.date}</h1>

	{#if form?.success && form.confirmation}
		<section class="mt-6 rounded-xl border border-emerald-300 bg-emerald-50 p-5" aria-live="polite">
			<h2 class="text-xl font-semibold">Votre fenêtre est inscrite</h2>
			<p class="mt-2">La date du {form.confirmation.date} est réservée.</p>
			<dl class="mt-4 space-y-2">
				<div>
					<dt class="font-semibold">Nom</dt>
					<dd>{form.confirmation.name}</dd>
				</div>
				<div>
					<dt class="font-semibold">Description</dt>
					<dd>{form.confirmation.description}</dd>
				</div>
				<div>
					<dt class="font-semibold">Adresse</dt>
					<dd>{form.confirmation.address}</dd>
				</div>
			</dl>
		</section>
	{:else if !data.available}
		<p class="mt-6 rounded-lg bg-slate-100 p-4" role="status">{data.unavailableMessage}</p>
	{:else}
		<p class="mt-3 text-slate-700">
			Les informations publiques ci-dessous seront affichées dans le calendrier. Vos coordonnées de
			contact resteront privées.
		</p>

		{#if form?.message}
			<div class="mt-5 rounded-lg border border-red-300 bg-red-50 p-4" role="alert">
				<p>{form.message}</p>
				{#if form.errors.length}
					<ul class="mt-2 list-disc pl-5">
						{#each form.errors as message, index (`${message}-${index}`)}
							<li>{message}</li>
						{/each}
					</ul>
				{/if}
			</div>
		{/if}
		{#if clientErrors.length}
			<div class="mt-5 rounded-lg border border-red-300 bg-red-50 p-4" role="alert">
				<p>Vérifiez les champs du formulaire.</p>
				<ul class="mt-2 list-disc pl-5">
					{#each clientErrors as message, index (`${message}-${index}`)}
						<li>{message}</li>
					{/each}
				</ul>
			</div>
		{/if}

		<form
			method="POST"
			class="mt-6 space-y-5"
			novalidate
			oninput={validateField}
			onfocusout={validateField}
			onsubmit={validateForm}
		>
			<div>
				<label class="mb-1 block font-medium" for="name"
					>Nom du participant ou de la structure</label
				>
				<input
					class="w-full rounded-lg border border-slate-300 p-3"
					id="name"
					name="name"
					aria-invalid={Boolean(getFieldError('name'))}
					aria-describedby={getFieldError('name') ? 'name-error' : undefined}
					required
					minlength="2"
					maxlength="100"
				/>
				{#if getFieldError('name')}
					<p class="mt-1 text-sm text-red-700" id="name-error" aria-live="polite">
						{getFieldError('name')}
					</p>
				{/if}
			</div>

			<div>
				<label class="mb-1 block font-medium" for="email">E-mail (facultatif)</label>
				<input
					class="w-full rounded-lg border border-slate-300 p-3"
					id="email"
					name="email"
					aria-invalid={Boolean(getFieldError('email'))}
					aria-describedby={getFieldError('email') ? 'email-error' : undefined}
					type="email"
					autocomplete="email"
				/>
				{#if getFieldError('email')}
					<p class="mt-1 text-sm text-red-700" id="email-error" aria-live="polite">
						{getFieldError('email')}
					</p>
				{/if}
			</div>

			<div>
				<label class="mb-1 block font-medium" for="phone">Téléphone (facultatif)</label>
				<input
					class="w-full rounded-lg border border-slate-300 p-3"
					id="phone"
					name="phone"
					aria-invalid={Boolean(getFieldError('phone'))}
					aria-describedby={getFieldError('phone') ? 'phone-error' : undefined}
					type="tel"
					autocomplete="tel"
				/>
				<p class="mt-1 text-sm text-slate-600">Indiquez au moins un moyen de contact.</p>
				{#if getFieldError('phone')}
					<p class="mt-1 text-sm text-red-700" id="phone-error" aria-live="polite">
						{getFieldError('phone')}
					</p>
				{/if}
			</div>

			<div>
				<label class="mb-1 block font-medium" for="description">Description de la fenêtre</label>
				<textarea
					class="min-h-28 w-full rounded-lg border border-slate-300 p-3"
					id="description"
					name="description"
					aria-invalid={Boolean(getFieldError('description'))}
					aria-describedby={getFieldError('description') ? 'description-error' : undefined}
					required
					minlength="5"
					maxlength="1000"></textarea>
				{#if getFieldError('description')}
					<p class="mt-1 text-sm text-red-700" id="description-error" aria-live="polite">
						{getFieldError('description')}
					</p>
				{/if}
			</div>

			<LocationPicker bind:address bind:latitude bind:longitude errors={fieldErrors} />

			<div class="rounded-lg bg-slate-50 p-4">
				<RulesContent content={data.rulesHtml} />
			</div>
			<p class="text-sm">
				<a class="underline underline-offset-4" href={resolve('/rules')}
					>Lire le règlement dans une page dédiée</a
				>
				<span> (version {data.rulesVersion})</span>
			</p>
			<label class="flex items-start gap-3">
				<input
					class="mt-1 size-5 shrink-0"
					type="checkbox"
					name="rulesAccepted"
					aria-invalid={Boolean(getFieldError('rulesAccepted'))}
					aria-describedby={getFieldError('rulesAccepted') ? 'rulesAccepted-error' : undefined}
					required
				/>
				<span
					>J’ai lu et j’accepte le règlement. Je comprends que les informations publiques seront
					publiées.</span
				>
			</label>
			{#if getFieldError('rulesAccepted')}
				<p class="text-sm text-red-700" id="rulesAccepted-error" aria-live="polite">
					{getFieldError('rulesAccepted')}
				</p>
			{/if}

			<button
				class="min-h-12 rounded-lg bg-emerald-800 px-5 font-semibold text-white hover:bg-emerald-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-800"
				type="submit"
			>
				Confirmer l’inscription
			</button>
		</form>
	{/if}
</main>
