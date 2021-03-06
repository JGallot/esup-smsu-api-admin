/**
 * SMS-U - Copyright (c) 2009-2014 Universite Paris 1 Pantheon-Sorbonne
 */
package org.esupportail.smsuapiadmin.domain.beans;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;

import org.esupportail.commons.utils.strings.StringUtils;

/**
 * The class that represent users.
 */
public class User implements Serializable {

	/**
	 * The serialization id.
	 */
	private static final long serialVersionUID = -1299846740464955785L;

	/**
	 * Id of the user.
	 */
	private String id;

	/**
	 * Display Name of the user.
	 */
	private String displayName;

	/**
	 * fonctions list.
	 */
	private List<EnumeratedFunction> fonctions = new ArrayList<EnumeratedFunction>();

	/**
	 * True for administrators.
	 */
	private boolean admin;

	/**
	 * The prefered language.
	 */
	private String language;

	/**
	 * Bean constructor.
	 */
	public User() {
		super();
	}

	/**
	 * @see java.lang.Object#equals(java.lang.Object)
	 */
	@Override
	public boolean equals(final Object obj) {
		if (obj == null) {
			return false;
		}
		if (!(obj instanceof User)) {
			return false;
		}
		return id.equals(((User) obj).getId());
	}

	/**
	 * @see java.lang.Object#hashCode()
	 */
	@Override
	public int hashCode() {
		return super.hashCode();
	}

	/**
	 * @see java.lang.Object#toString()
	 */
	@Override
	public String toString() {
		return "User#" + hashCode() + "[id=[" + id + "], displayName=["
				+ displayName + "], admin=[" + admin + "], language=["
				+ language + "]]";
	}

	/**
	 * @return the id of the user.
	 */
	public String getId() {
		return id;
	}

	/**
	 * @param id
	 */
	public void setId(final String id) {
		this.id = StringUtils.nullIfEmpty(id);
	}

	/**
	 * @return Returns the displayName.
	 */
	public String getDisplayName() {
		return this.displayName;
	}

	/**
	 * @param displayName
	 *            The displayName to set.
	 */
	public void setDisplayName(final String displayName) {
		this.displayName = StringUtils.nullIfEmpty(displayName);
	}

	/**
	 * @param admin
	 *            The admin to set.
	 */
	public void setAdmin(final boolean admin) {
		this.admin = admin;
	}

	/**
	 * @return Returns the admin.
	 */
	public boolean getAdmin() {
		return this.admin;
	}

	/**
	 * @return the language
	 */
	public String getLanguage() {
		return language;
	}

	/**
	 * @param language
	 *            the language to set
	 */
	public void setLanguage(final String language) {
		this.language = StringUtils.nullIfEmpty(language);
	}

	/**
	 * @param fonctions
	 *            the fonctions to set
	 */
	public void setFonctions(final List<EnumeratedFunction> fonctions) {
		this.fonctions = fonctions;
	}

	/**
	 * @return the fonctions
	 */
	public List<EnumeratedFunction> getFonctions() {
		return fonctions;
	}

}
