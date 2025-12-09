import { DOMElements } from "../core/dom-elements.js";
import { AuthManager } from "../auth/auth-manager.js";
import { userSession } from "../auth/user-session.js";

// Constantes de validation
const MAX_AVATAR_SIZE = 5 * 1024 * 1024; // 5MB en bytes

/**
 * ProfileEditManager
 * Gère la modal d'édition du profil utilisateur
 */
export class ProfileEditManager {
  private _DO: DOMElements;
  private selectedPhotoFile: File | null = null;
  private originalData: { username: string; email: string } | null = null;

  constructor(dO: DOMElements) {
    this._DO = dO;
  }

  /**
   * Ouvre la modal d'édition avec les données actuelles de l'utilisateur
   */
  public async openEditModal(): Promise<void> {
    const userData = AuthManager.getUserData();
    if (!userData) {
      return;
    }

    try {
      // Récupérer les données complètes depuis l'API
      const response = await fetch(`/api/users/${userData.id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include' // Envoie automatiquement le cookie auth_token
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des données');
      }

      const result = await response.json();
      const user = result.data;

      // Sauvegarder les données originales pour détecter les changements
      this.originalData = {
        username: user.username || '',
        email: user.email || ''
      };

      // Pré-remplir les champs
      this._DO.profileEditModal.inputUsername.value = this.originalData.username;
      this._DO.profileEditModal.inputEmail.value = this.originalData.email;
      this._DO.profileEditModal.inputPassword.value = '';
      this._DO.profileEditModal.inputPasswordConfirm.value = '';
      this._DO.profileEditModal.photoPreview.src = user.avatar_url || '/static/util/icon/profile.png';

      // Réinitialiser
      this.selectedPhotoFile = null;
      this.hideMessage();

      // Afficher la modal
      this._DO.profileEditModal.modal.classList.remove('hidden');

      // Attacher les event listeners
      this.attachEventListeners();
    } catch (error) {
    }
  }

  /**
   * Attache les event listeners de la modal
   */
  private attachEventListeners(): void {
    // Upload photo
    const photoInputHandler = (e: Event) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        this.handlePhotoSelect(file);
      }
    };

    // Submit formulaire
    const submitHandler = async (e: Event) => {
      e.preventDefault();
      await this.handleSave();
    };

    // Bouton annuler
    const cancelHandler = () => {
      this.closeModal();
    };

    // Escape pour fermer
    const escapeHandler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        this.closeModal();
      }
    };

    // Cleanup
    const cleanup = () => {
      this._DO.profileEditModal.photoInput.removeEventListener('change', photoInputHandler);
      this._DO.profileEditModal.form.removeEventListener('submit', submitHandler);
      this._DO.profileEditModal.btnCancel.removeEventListener('click', cancelHandler);
      window.removeEventListener('keydown', escapeHandler);
    };

    // Store cleanup pour pouvoir l'appeler plus tard
    (this._DO.profileEditModal.modal as any)._cleanup = cleanup;

    this._DO.profileEditModal.photoInput.addEventListener('change', photoInputHandler);
    this._DO.profileEditModal.form.addEventListener('submit', submitHandler);
    this._DO.profileEditModal.btnCancel.addEventListener('click', cancelHandler);
    window.addEventListener('keydown', escapeHandler);
  }

  /**
   * Gère la sélection d'une photo
   */
  private handlePhotoSelect(file: File): void {
    // Vérifier le type
    if (!file.type.startsWith('image/')) {
      this.showMessage('Veuillez sélectionner une image valide', 'error');
      return;
    }

    // Vérifier la taille
    if (file.size > MAX_AVATAR_SIZE) {
      this.showMessage('L\'image ne doit pas dépasser 5MB', 'error');
      return;
    }

    this.selectedPhotoFile = file;

    // Prévisualiser
    const reader = new FileReader();
    reader.onload = (e) => {
      this._DO.profileEditModal.photoPreview.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }

  /**
   * Sauvegarde les modifications
   */
  private async handleSave(): Promise<void> {
    const username = this._DO.profileEditModal.inputUsername.value.trim();
    const email = this._DO.profileEditModal.inputEmail.value.trim();
    const password = this._DO.profileEditModal.inputPassword.value;
    const passwordConfirm = this._DO.profileEditModal.inputPasswordConfirm.value;

    if (!this.originalData) {
      this.showMessage('Erreur: données originales manquantes', 'error');
      return;
    }

    // Déterminer ce qui a changé
    const usernameChanged = username !== this.originalData.username;
    const emailChanged = email !== this.originalData.email;
    const passwordChanged = password.length > 0;
    const photoChanged = this.selectedPhotoFile !== null;

    // Vérifier qu'au moins un champ a changé
    if (!usernameChanged && !emailChanged && !passwordChanged && !photoChanged) {
      this.showMessage('Aucune modification détectée', 'error');
      return;
    }

    // Validation uniquement des champs modifiés
    if (usernameChanged && username.length < 1) {
      this.showMessage('Le nom d\'utilisateur ne peut pas être vide', 'error');
      return;
    }

    if (emailChanged) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        this.showMessage('Veuillez entrer un email valide', 'error');
        return;
      }
    }

    if (passwordChanged) {
      if (password.length < 6) {
        this.showMessage('Le mot de passe doit contenir au moins 6 caractères', 'error');
        return;
      }

      if (password !== passwordConfirm) {
        this.showMessage('Les mots de passe ne correspondent pas', 'error');
        return;
      }
    }

    // Désactiver le bouton
    this._DO.profileEditModal.btnSave.disabled = true;

    try {
      const userData = AuthManager.getUserData();
      if (!userData) throw new Error('Pas de données utilisateur');

      // Préparer FormData UNIQUEMENT avec les champs modifiés
      const formData = new FormData();

      if (usernameChanged) {
        formData.append('username', username);
      }

      if (emailChanged) {
        formData.append('email', email);
      }

      if (passwordChanged) {
        formData.append('password', password);
      }

      if (photoChanged) {
        formData.append('avatar', this.selectedPhotoFile!);
      }

      const response = await fetch(`/api/users/${userData.id}`, {
        method: 'PUT',
        // Pas de Content-Type car FormData le gère automatiquement
        credentials: 'include', // Envoie automatiquement le cookie auth_token
        body: formData
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erreur lors de la mise à jour');
      }

      const result = await response.json();

      // Mettre à jour la session en mémoire avec les nouvelles données
      const updatedUser = {
        id: userData.id,
        username: result.data.username,
        email: result.data.email
      };
      userSession.setUser(updatedUser);

      // Mettre à jour le username affiché sur la page profile (SPA - pas de reload)
      const usernameElement = this._DO.profile.username;
      if (usernameElement) {
        usernameElement.textContent = result.data.username;
      }

      this.showMessage('Profil mis à jour avec succès !', 'success');

      // Fermer après 1.5s
      setTimeout(() => {
        this.closeModal();
      }, 1500);
    } catch (error: any) {
      this.showMessage(error.message || 'Erreur lors de la mise à jour', 'error');
      this._DO.profileEditModal.btnSave.disabled = false;
    }
  }

  /**
   * Ferme la modal
   */
  private closeModal(): void {
    this._DO.profileEditModal.modal.classList.add('hidden');

    // Cleanup listeners
    const cleanup = (this._DO.profileEditModal.modal as any)._cleanup;
    if (cleanup) cleanup();
  }

  /**
   * Affiche un message dans la modal
   */
  private showMessage(text: string, type: 'success' | 'error'): void {
    this._DO.profileEditModal.message.textContent = text;
    this._DO.profileEditModal.message.className = `profile-edit-message ${type}`;
    this._DO.profileEditModal.message.classList.remove('hidden');
  }

  /**
   * Cache le message
   */
  private hideMessage(): void {
    this._DO.profileEditModal.message.classList.add('hidden');
  }
}
