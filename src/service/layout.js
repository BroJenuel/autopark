import SnapStorage from 'snap-storage';
import { useLayout } from '@/layout/composables/layout';
const { changeThemeSettings, setScale, layoutConfig } = useLayout();
export const changeTheme = (theme, mode) => {
    SnapStorage.set('auto-park-theme', {
        theme,
        mode
    });
    const elementId = 'theme-css';
    const linkElement = document.getElementById(elementId);
    const cloneLinkElement = linkElement.cloneNode(true);
    const newThemeUrl = linkElement.getAttribute('href').replace(layoutConfig.theme.value, theme);
    cloneLinkElement.setAttribute('id', elementId + '-clone');
    cloneLinkElement.setAttribute('href', newThemeUrl);
    cloneLinkElement.addEventListener('load', () => {
        linkElement.remove();
        cloneLinkElement.setAttribute('id', elementId);
        changeThemeSettings(theme, mode === 'dark');
    });
    linkElement.parentNode.insertBefore(cloneLinkElement, linkElement.nextSibling);
}

/**
 * To Be used when mounting or checking theme
 */
export const checkTheme = () => {
    const savedTheme = SnapStorage.get('auto-park-theme');
    if (savedTheme) {
        changeTheme(savedTheme.theme, savedTheme.mode);
    } else {
        changeTheme('arya-orange', 'dark');
    }
}