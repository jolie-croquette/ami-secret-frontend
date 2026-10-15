/**
 * Versions « conscientes de la langue » des composants de react-router : les
 * chemins absolus reçoivent automatiquement le préfixe `/en` quand le site est
 * affiché en anglais. Les hooks équivalents sont dans `./navigation`.
 */
import { forwardRef } from 'react';
import {
  Link as RRLink,
  NavLink as RRNavLink,
  Navigate as RRNavigate,
  type LinkProps,
  type NavLinkProps,
  type NavigateProps,
} from 'react-router-dom';
import { localizeTo, useLang } from './navigation';

export const Link = forwardRef<HTMLAnchorElement, LinkProps>(function Link({ to, ...rest }, ref) {
  const lang = useLang();
  return <RRLink ref={ref} to={localizeTo(to, lang)} {...rest} />;
});

export const NavLink = forwardRef<HTMLAnchorElement, NavLinkProps>(function NavLink({ to, ...rest }, ref) {
  const lang = useLang();
  return <RRNavLink ref={ref} to={localizeTo(to, lang)} {...rest} />;
});

export function Navigate({ to, ...rest }: NavigateProps) {
  const lang = useLang();
  return <RRNavigate to={localizeTo(to, lang)} {...rest} />;
}
